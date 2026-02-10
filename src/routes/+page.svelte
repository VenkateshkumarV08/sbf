<script lang="ts">
	import { onMount } from "svelte";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { signOutAndRedirect, getUserEmail } from "$lib/auth/utils";
	import { authStore } from "$lib/stores/auth.svelte";
	import { chatStore } from "$lib/stores/chat.svelte";
	import * as Chat from "$lib/components/ui/chat";
	import { SendHorizontal, RotateCcw, LogOut } from "@lucide/svelte";
	import favicon from "$lib/assets/favicon.svg";
	import SvelteMarkdown from "@humanspeak/svelte-markdown";
	import { UseAutoScroll } from "$lib/hooks/use-auto-scroll.svelte";
	import MarkdownLink from "$lib/components/MarkdownLink.svelte";

	const userEmail = $derived(authStore.session ? getUserEmail() : null);
	let messageInput = $state("");
	let isSending = $state(false);
	const autoScroll = new UseAutoScroll();

	const quickActions = [
		{ icon: "📚", text: "What is MCPP?" },
		{ icon: "✍️", text: "How to apply?" },
		{ icon: "✅", text: "Eligibility criteria" },
		{ icon: "💰", text: "Funding information" },
	];

	onMount(() => {
		// Wait for auth to load before initializing chat
		const initChat = async () => {
			// Wait for auth store to finish loading
			let attempts = 0;
			while (authStore.loading && attempts < 50) {
				await new Promise(resolve => setTimeout(resolve, 100));
				attempts++;
			}

			if (authStore.session) {
				chatStore.initialize();
			}
		};

		initChat();
	});

	// Auto-scroll to bottom when messages change
	// $effect(() => {
	// 	chatStore.messages.length; // Track messages
	// 	autoScroll.scrollToBottom(false); // Force scroll regardless of user position
	// });

	async function handleSendMessage() {
		if (!messageInput.trim() || isSending) return;

		const text = messageInput.trim();
		messageInput = "";
		isSending = true;

		try {
			await chatStore.sendMessage(text);
		} finally {
			isSending = false;
		}
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	}

	function sendQuickAction(text: string) {
		messageInput = text;
		handleSendMessage();
	}

	function handleResetChat() {
		if (confirm("Are you sure you want to reset the chat? This will clear all messages.")) {
			chatStore.reset();
			if (authStore.session) {
				chatStore.initialize();
			}
		}
	}

	function preprocessMarkdown(content: string): string {
		return content
			.replace(/\\n/g, "\n") // Convert escaped newlines to actual newlines
			.replace(/<(https?:\/\/[^>]+)>/g, "[$1]($1)") // Convert <url> to [url](url)
			.replace(/^• /gm, "- ") // Convert bullet points to markdown list format
			.trim();
	}

	function formatTimestamp(date: Date): string {
		const now = new Date();
		const isToday = date.toDateString() === now.toDateString();

		const hours = date.getHours().toString().padStart(2, "0");
		const minutes = date.getMinutes().toString().padStart(2, "0");
		const timeStr = `${hours}:${minutes}`;

		if (isToday) {
			return timeStr;
		}

		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0");

		return `${day}-${month} ${timeStr}`;
	}
</script>

<div class="flex flex-col h-screen">
	<nav class="w-full p-2 sm:p-4 bg-white border-b-5 border-primary shrink-0">
		<div class="flex items-center gap-2 sm:gap-5">
			<img
				src={favicon}
				alt="SBF Logo"
				class="h-8 sm:h-10 w-auto drop-shadow-md hover:scale-105 transition-transform"
			/>
			<div class="flex-1 min-w-0">
				<h6 class="text-sm sm:text-lg font-bold text-primary tracking-tight truncate">
					MCPP Digital Assistant
				</h6>
				<p class="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
					Ask me about Mid-Career Pathways Programme (MCPP)
				</p>
				<!-- <div
					class="flex items-center gap-2 mt-1.5 text-xs text-(--chat-success) font-medium"
				>
					<span
						class="w-2 h-2 bg-(--chat-success) rounded-full animate-pulse-dot"
					></span>
					<span>Online</span>
				</div> -->
			</div>
			{#if userEmail}
				<div class="flex gap-1 sm:gap-2">
					<Button
						onclick={handleResetChat}
						variant="outline"
						size="sm"
						title="Reset chat"
						class="px-2 sm:px-3"
					>
						<RotateCcw class="w-3 h-3 sm:w-4 sm:h-4" />
						<span class="hidden sm:inline ml-1">Reset</span>
					</Button>
					<Button
						onclick={signOutAndRedirect}
						variant="outline"
						size="sm"
						class="px-2 sm:px-3"
					>
						<LogOut class="w-3 h-3 sm:w-4 sm:h-4" />
						<span class="hidden sm:inline ml-1">Sign Out</span>
					</Button>
				</div>
			{/if}
		</div>
	</nav>
	<main
		class="flex-1 w-full md:max-w-4xl xl:max-w-7xl mx-auto flex flex-col overflow-hidden bg-gray-50"
	>
		<!-- Scrollable Chat List -->
		<div
			class="flex-1 overflow-y-auto p-2 sm:p-6 relative"
			bind:this={autoScroll.ref}
		>
			<Chat.List class="h-full px-2 sm:px-6 pb-4">
				{#each chatStore.messages as message (message.id)}
					<!-- {@const sender = users.find((u) => u.id === message.senderId)} -->
					<Chat.Bubble
						timestamp={formatTimestamp(message.timestamp)}
						variant={message.isUser ? "sent" : "received"}
						class="animate-in slide-in-from-bottom-4 duration-400 overflow-x-auto"
					>
						<Chat.BubbleAvatar>
							<!-- <Chat.BubbleAvatarImage src={sender?.img} alt={sender?.username} />
							<Chat.BubbleAvatarFallback>
								{initials(sender?.name ?? '')}
							</Chat.BubbleAvatarFallback> -->

							<div
								class="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold {message.isUser
									? 'bg-green-600'
									: 'bg-primary'} text-sm"
							>
								{message.isUser
									? userEmail
										? userEmail.charAt(0).toUpperCase()
										: "U"
									: "AI"}
							</div>
						</Chat.BubbleAvatar>
						<Chat.BubbleMessage
							class="{message.isUser
								? 'chat-bubble-user'
								: 'chat-bubble-bot markdown-content'} overflow-x-auto"
						>
							{#if message.isUser}
								{message.content}
							{:else}
								<SvelteMarkdown 
									source={message.content}
									renderers={{ link: MarkdownLink }}
								/>
							{/if}
						</Chat.BubbleMessage>
					</Chat.Bubble>
				{/each}

				{#if chatStore.isTyping}
					<Chat.Bubble
						variant="received"
						class="animate-in fade-in duration-300"
					>
						<Chat.BubbleAvatar>
							<div
								class="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold bg-primary text-sm"
							>
								AI
							</div>
						</Chat.BubbleAvatar>
						<Chat.BubbleMessage class="chat-bubble-bot">
							{#if !chatStore.showDetailedLoader}
								<!-- Simple loader for first 2 seconds -->
								<div
									class="flex items-center gap-2 text-muted-foreground py-2"
								>
									<div class="flex gap-1">
										<span
											class="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"
										></span>
										<span
											class="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"
										></span>
										<span
											class="w-2 h-2 bg-primary rounded-full animate-bounce"
										></span>
									</div>
								</div>
							{:else}
								<!-- Detailed step loader after 2 seconds -->
								<div class="flex flex-col gap-3 py-2">
									{#each ["Routing to the relevant department", "Finding the relevant information", "Getting the contact details", "Checking for any available links", "Formatting the response"] as step, index}
										<div class="flex items-center gap-3">
											{#if chatStore.allStepsCompleted || index < chatStore.loadingStep}
												<!-- Completed -->
												<div
													class="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0"
												>
													<svg
														class="w-3 h-3 text-white"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="3"
															d="M5 13l4 4L19 7"
														></path>
													</svg>
												</div>
												<span
													class="text-sm {chatStore.allStepsCompleted ? 'text-green-600 font-medium' : 'text-muted-foreground'}"
													>{step}</span
												>
											{:else if index === chatStore.loadingStep}
												<!-- Current -->
												<div
													class="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0"
												>
													<div
														class="w-2 h-2 bg-primary rounded-full animate-pulse"
													></div>
												</div>
												<span
													class="text-sm font-medium text-primary"
													>{step}</span
												>
											{:else}
												<!-- Pending -->
												<div
													class="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0"
												></div>
												<span
													class="text-sm text-gray-400"
													>{step}</span
												>
											{/if}
										</div>
									{/each}
								</div>
							{/if}
						</Chat.BubbleMessage>
					</Chat.Bubble>
				{/if}
			</Chat.List>
		</div>

		<!-- Fixed Quick Actions -->
		{#if chatStore.messages.length === 1}
			<div
				class="px-2 sm:px-6 py-3 sm:py-4 flex flex-wrap gap-2 bg-linear-to-b from-(--chat-bg-gradient-dark) to-white"
			>
				{#each quickActions as action}
					<button
						onclick={() => sendQuickAction(action.text)}
						class="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border-2 border-(--chat-border-light) rounded-full text-xs sm:text-sm font-medium text-(--chat-text-gray) cursor-pointer transition-all duration-200 hover:bg-(--chat-brand-primary) hover:text-white hover:border-(--chat-brand-primary) hover:-translate-y-0.5 hover:shadow-lg"
					>
						{action.icon}
						{action.text}
					</button>
				{/each}
			</div>
		{/if}

		<!-- Fixed Input -->
		<div
			class="px-2 sm:px-6 py-3 sm:py-5 bg-white border rounded-2xl mb-2 sm:mb-4 border-(--chat-border-light)"
		>
			<div class="flex gap-2 sm:gap-3">
				<Input
					type="text"
					placeholder={chatStore.isInitialized
						? "Type your message..."
						: "Initializing..."}
					disabled={!chatStore.isInitialized || isSending}
					bind:value={messageInput}
					onkeypress={handleKeyPress}
					class="chat-input text-sm sm:text-base"
				/>
				<Button
					onclick={handleSendMessage}
					disabled={!chatStore.isInitialized ||
						isSending ||
						!messageInput.trim()}
					class="chat-send-btn px-3 sm:px-4"
				>
					<SendHorizontal class="w-4 h-4 sm:w-5 sm:h-5" />
					<span class="hidden sm:inline ml-1">Send</span>
				</Button>
			</div>
		</div>
	</main>
</div>
