<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { authStore } from '$lib/stores/auth.svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	// Client-side route protection
	$effect(() => {
		if (browser) {
			const currentPath = page.url.pathname;
			const isLoginPage = currentPath === '/login';
			
			// Redirect to login if not authenticated and not on login page
			if (!authStore.isAuthenticated && !authStore.loading && !isLoginPage) {
				goto('/login');
			}
			
			// Redirect to home if authenticated and on login page
			if (authStore.isAuthenticated && isLoginPage) {
				goto('/');
			}
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
