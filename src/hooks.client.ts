import { browser } from '$app/environment';
import { getCurrentSession } from '$lib/auth/cognito';
import { authStore } from '$lib/stores/auth.svelte';

if (browser) {
	// Initialize auth state on client side
	getCurrentSession().then((session) => {
		authStore.setSession(session);
	});
}
