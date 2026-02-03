<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import { authenticateUser, completeNewPasswordChallenge } from '$lib/auth/cognito';
	import { authStore } from '$lib/stores/auth.svelte';
	import type { CognitoUser } from 'amazon-cognito-identity-js';

    import favicon from '$lib/assets/favicon.svg';

	let email = $state('');
	let password = $state('');
	let newPassword = $state('');
	let loading = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');
	let showNewPasswordForm = $state(false);
	let cognitoUser: CognitoUser | null = $state(null);

	async function handleLogin() {
		if (!email || !password) {
			errorMessage = 'Please enter both email and password';
			return;
		}

		loading = true;
		errorMessage = '';
		successMessage = '';

		try {
			const result = await authenticateUser(email, password);
			
			console.log('Login result:', result); // Debug log

			if (result.success && result.session) {
				authStore.setSession(result.session);
				successMessage = 'Login successful! Redirecting...';
				// Navigation will happen automatically via layout effect
				setTimeout(() => {
					goto('/');
				}, 300);
			} else if (result.requiresNewPassword && result.newPasswordData) {
				cognitoUser = result.newPasswordData.cognitoUser;
				showNewPasswordForm = true;
				successMessage = result.message || 'Please set a new password';
			} else {
				// Login failed
				console.error('Login failed:', result.message); // Debug log
				errorMessage = result.message || 'Invalid email or password. Please try again.';
			}
		} catch (error) {
			console.error('Login error:', error); // Debug log
			errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
		} finally {
			loading = false;
		}
	}

	async function handleSetNewPassword() {
		if (!newPassword) {
			errorMessage = 'Please enter a new password';
			return;
		}

		if (newPassword.length < 8) {
			errorMessage = 'Password must be at least 8 characters';
			return;
		}

		if (!cognitoUser) {
			errorMessage = 'Session expired. Please login again.';
			return;
		}

		loading = true;
		errorMessage = '';

		try {
			const result = await completeNewPasswordChallenge(cognitoUser, newPassword);

			if (result.success && result.session) {
				authStore.setSession(result.session);
				successMessage = 'Password set! Redirecting...';
				// Navigation will happen automatically via layout effect
				setTimeout(() => {
					goto('/');
				}, 300);
			} else {
				errorMessage = result.message || 'Failed to set password';
			}
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-500 to-teal-600 p-4">
	<Card.Root class="w-full max-w-md">
		<Card.Header class="text-center space-y-4">
			<img
				src={favicon}
				alt="SBF Logo"
				class="h-16 w-auto mx-auto"
			/>
			<div>
				<Card.Title class="text-2xl text-cyan-600">MCPP Digital Assistant</Card.Title>
				<Card.Description>Sign in to continue</Card.Description>
			</div>
		</Card.Header>

		<Card.Content class="space-y-4">
			{#if errorMessage}
				<div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
					{errorMessage}
				</div>
			{/if}

			{#if successMessage}
				<div class="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
					{successMessage}
				</div>
			{/if}

			{#if !showNewPasswordForm}
				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleLogin();
					}}
					class="space-y-4"
				>
					<div class="space-y-2">
						<Label for="email">Email</Label>
						<Input
							id="email"
							type="email"
							bind:value={email}
							placeholder="Email"
							required
							autocomplete="username"
							disabled={loading}
							onkeydown={(e) => e.key === 'Enter' && handleLogin()}
						/>
					</div>

					<div class="space-y-2">
						<Label for="password">Password</Label>
						<Input
							id="password"
							type="password"
                            placeholder="Password"
							bind:value={password}
							required
							autocomplete="current-password"
							disabled={loading}
							onkeydown={(e) => e.key === 'Enter' && handleLogin()}
						/>
					</div>

					<Button type="submit" class="w-full bg-gradient-to-r from-cyan-500 to-teal-600" disabled={loading}>
						{loading ? 'Signing in...' : 'Sign In'}
					</Button>
				</form>
			{:else}
				<div class="space-y-4">
					<h3 class="text-lg font-semibold">Set New Password</h3>

					<div class="space-y-2">
						<Label for="newPassword">New Password</Label>
						<Input
							id="newPassword"
							type="password"
							bind:value={newPassword}
							placeholder="New Password"
							required
							disabled={loading}
							onkeydown={(e) => e.key === 'Enter' && handleSetNewPassword()}
						/>
						<p class="text-xs text-muted-foreground">
							Min 8 characters, including uppercase, lowercase, and number
						</p>
					</div>

					<Button
						type="button"
						onclick={handleSetNewPassword}
						class="w-full bg-gradient-to-r from-cyan-500 to-teal-600"
						disabled={loading}
					>
						{loading ? 'Setting Password...' : 'Set Password'}
					</Button>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>