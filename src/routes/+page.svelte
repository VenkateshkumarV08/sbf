<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { signOutAndRedirect, getUserEmail } from '$lib/auth/utils';
	import { authStore } from '$lib/stores/auth.svelte';
    
	import * as Chat from "$lib/components/ui/chat";

	const userEmail = $derived(authStore.session ? getUserEmail() : null);
</script>

<div class="container mx-auto p-8 space-y-6">
	<div class="flex justify-between items-center">
		<div>
			<h1 class="text-3xl font-bold">Welcome to SBF MCPP Digital Assistant</h1>
			{#if userEmail}
				<p class="text-sm text-muted-foreground mt-1">Logged in as: {userEmail}</p>
			{/if}
		</div>
		{#if authStore.isAuthenticated}
			<Button onclick={signOutAndRedirect} variant="outline">Sign Out</Button>
		{/if}
	</div>

	<div class="bg-card p-6 rounded-lg shadow">
		<p class="text-muted-foreground">
			You are successfully authenticated! Visit <a
				href="https://svelte.dev/docs/kit"
				class="text-primary underline"
			>
				svelte.dev/docs/kit
			</a> to read the SvelteKit documentation.
		</p>
	</div>

	{#if authStore.session}
		<div class="bg-muted p-4 rounded-lg">
			<h2 class="font-semibold mb-2">Session Info</h2>
			<p class="text-sm text-muted-foreground">
				Access Token: {authStore.session.getAccessToken().getJwtToken().substring(0, 50)}...
			</p>
		</div>
	{/if}

    <Chat.List>
        <Chat.Bubble>
            <Chat.BubbleAvatar>
                <Chat.BubbleAvatarImage 
                    src="https://github.com/shadcn.png" 
                    alt="@shadcn" 
                />
                <Chat.BubbleAvatarFallback>
                    CN
                </Chat.BubbleAvatarFallback>
            </Chat.BubbleAvatar>
            <Chat.BubbleMessage>
                Hello, World!
            </Chat.BubbleMessage>
        </Chat.Bubble>
    </Chat.List>
</div>
