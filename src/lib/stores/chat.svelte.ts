import { initializeLexClient, sendMessageToLex, generateSessionId } from '$lib/services/lex';
import { authStore } from './auth.svelte';

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
			return;
		}

		try {
			initializeLexClient(authStore.session);
			this.isInitialized = true;
			this.error = null;

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
		}, 2000);
	}

	private stopLoadingAnimation() {
		if (this.loadingInterval) {
			clearTimeout(this.loadingInterval);
			this.loadingInterval = null;
		}
		if (this.detailedLoaderTimeout) {
			clearTimeout(this.detailedLoaderTimeout);
			this.detailedLoaderTimeout = null;
		}
		this.loadingStep = 0;
		this.showDetailedLoader = false;
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
		console.log('Message added:', message);
		console.log('All messages:', this.messages);
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
			this.error = err instanceof Error ? err.message : 'Failed to send message';
			this.addMessage('Sorry, there was an error processing your request.', false);
		} finally {
			this.stopLoadingAnimation();
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
