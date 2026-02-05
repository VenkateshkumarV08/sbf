import { browser } from '$app/environment';
import { getCurrentSession } from '$lib/auth/cognito';
import { authStore } from '$lib/stores/auth.svelte';

if (browser) {
	// Initialize auth state on client side
	authStore.setLoading(true);
	getCurrentSession()
		.then((session) => {
			authStore.setSession(session);
			console.log('Auth session loaded:', session ? 'authenticated' : 'not authenticated');
		})
		.catch((err) => {
			console.error('Error loading auth session:', err);
			authStore.setSession(null);
		});
}
