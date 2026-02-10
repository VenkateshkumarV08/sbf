import { initializeLexClient, sendMessageToLex, generateSessionId } from '$lib/services/lex';
import { authStore } from './auth.svelte';
import { refreshSession } from '$lib/auth/cognito';

export interface ChatMessage {
	id: string;
	content: string;
	isUser: boolean;
	timestamp: Date;
}

interface PersistedChatData {
	messages: ChatMessage[];
	sessionId: string;
}

class ChatStore {
	messages = $state<ChatMessage[]>([]);
	isTyping = $state(false);
	loadingStep = $state(0);
	showDetailedLoader = $state(false);
	allStepsCompleted = $state(false);
	sessionId = $state(generateSessionId());
	isInitialized = $state(false);
	error = $state<string | null>(null);

	
	private loadingInterval: number | null = null;
	private detailedLoaderTimeout: number | null = null;

	constructor() {
		this.loadFromStorage();
	}

	private loadFromStorage() {
		if (typeof window === 'undefined') return;

		try {
			const stored = sessionStorage.getItem('chat-data');
			if (stored) {
				const data: PersistedChatData = JSON.parse(stored);
				this.messages = data.messages.map((msg) => ({
					...msg,
					timestamp: new Date(msg.timestamp)
				}));
				this.sessionId = data.sessionId;
			}
		} catch (err) {
			console.error('Error loading chat from storage:', err);
		}
	}

	private saveToStorage() {
		if (typeof window === 'undefined') return;

		try {
			const data: PersistedChatData = {
				messages: this.messages,
				sessionId: this.sessionId
			};
			sessionStorage.setItem('chat-data', JSON.stringify(data));
		} catch (err) {
			console.error('Error saving chat to storage:', err);
		}
	}

	initialize() {
		if (!authStore.session) {
			this.error = 'Not authenticated';
			console.error('Chat initialization failed: No auth session');
			return;
		}

		try {
			initializeLexClient(authStore.session);
			this.isInitialized = true;
			this.error = null;
			console.log('Chat initialized successfully');

			// Add welcome message only if no messages exist
			if (this.messages.length === 0) {
				this.addMessage(
					'Hi! I am MCPP Bot. Let me assist you with our programme information and application process for host organisations. Start the conversation by typing your question.',
					false
				);
			}
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to initialize chat';
			console.error('Error initializing Lex client:', err);
		}
	}

	private scheduleNextStep() {
		if (this.loadingStep >=4) return;

		const randomDelay = Math.floor(Math.random() * 4000) + 1000; // Random 1-5 seconds
		this.loadingInterval = window.setTimeout(() => {
			this.loadingStep++;
			if (this.loadingStep < 5) {
				this.scheduleNextStep();
			}
		}, randomDelay);
	}

	private startLoadingAnimation() {
		this.loadingStep = 0;
		this.showDetailedLoader = false;

		if (this.loadingInterval) {
			clearTimeout(this.loadingInterval);
		}
		if (this.detailedLoaderTimeout) {
			clearTimeout(this.detailedLoaderTimeout);
		}

		// Show detailed loader after 2 seconds
		this.detailedLoaderTimeout = window.setTimeout(() => {
			this.showDetailedLoader = true;
			this.scheduleNextStep();
		}, 4000);
	}

	private async stopLoadingAnimation() {
		if (this.loadingInterval) {
			clearTimeout(this.loadingInterval);
			this.loadingInterval = null;
		}
		if (this.detailedLoaderTimeout) {
			clearTimeout(this.detailedLoaderTimeout);
			this.detailedLoaderTimeout = null;
		}
		
		// If detailed loader was shown, complete remaining steps one by one
		if (this.showDetailedLoader && this.loadingStep < 5) {
			while (this.loadingStep < 5) {
				await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 sec delay
				this.loadingStep++;
			}
			this.allStepsCompleted = true;
			// Wait 1 second to show all steps completed
			await new Promise(resolve => setTimeout(resolve, 500));
		}
		
		this.loadingStep = 0;
		this.showDetailedLoader = false;
		this.allStepsCompleted = false;
	}


	addMessage(content: string, isUser: boolean) {
		const message: ChatMessage = {
			id: `${Date.now()}-${Math.random()}`,
			content,
			isUser,
			timestamp: new Date()
		};
		this.messages.push(message);
		this.saveToStorage();
		// console.log('Message added:', message);
		// console.log('All messages:', this.messages);
	}

	async sendMessage(text: string) {
		if (!this.isInitialized) {
			this.error = 'Chat not initialized';
			return;
		}

		if (!text.trim()) return;

		// Add user message
		this.addMessage(text, true);
		this.isTyping = true;
		this.startLoadingAnimation();
		this.error = null;

		try {
			const response = await sendMessageToLex(text, this.sessionId);

			// Complete loading animation before showing response
			await this.stopLoadingAnimation();

			// Add bot messages
			if (response.messages && response.messages.length > 0) {
				response.messages.forEach((msg) => {
					if (msg.content) {
						this.addMessage(msg.content, false);
					}
				});
			} else {
				this.addMessage('I received your message but have no response.', false);
			}
		} catch (err) {
			console.error('Error sending message to Lex:', err);
			
			// Check if it's a token expiration error
			if (err instanceof Error && err.message.includes('Token expired')) {
				console.log('Token expired, attempting to refresh...');
				
				// Try to refresh the session
				const newSession = await refreshSession();
				
				if (newSession) {
					// Update auth store with new session
					authStore.setSession(newSession);
					
					// Reinitialize Lex client with new session
					initializeLexClient(newSession);
					
					console.log('Session refreshed successfully, retrying message...');
					
					// Retry sending the message
					try {
						const response = await sendMessageToLex(text, this.sessionId);
						
						// Complete loading animation before showing response
						await this.stopLoadingAnimation();
						
						// Add bot messages
						if (response.messages && response.messages.length > 0) {
							response.messages.forEach((msg) => {
								if (msg.content) {
									this.addMessage(msg.content, false);
								}
							});
						} else {
							this.addMessage('I received your message but have no response.', false);
						}
						
						this.isTyping = false;
						return;
					} catch (retryErr) {
						console.error('Error after retry:', retryErr);
						await this.stopLoadingAnimation();
						this.addMessage('Sorry, there was an error processing your request after refreshing the session.', false);
					}
				} else {
					// Session refresh failed, user needs to log in again
					await this.stopLoadingAnimation();
					this.addMessage('Your session has expired. Please log in again.', false);
					this.error = 'Session expired';
				}
			} else {
				// Other errors
				this.error = err instanceof Error ? err.message : 'Failed to send message';
				await this.stopLoadingAnimation();
				this.addMessage('Sorry, there was an error processing your request.', false);
			}
		} finally {
			this.isTyping = false;
		}
	}

	reset() {
		this.messages = [];
		this.sessionId = generateSessionId();
		this.isTyping = false;
		this.error = null;
		if (typeof window !== 'undefined') {
			sessionStorage.removeItem('chat-data');
		}
	}
}

export const chatStore = new ChatStore();
