// Auth utility functions for use in components

import { goto } from '$app/navigation';
import { authStore } from '$lib/stores/auth.svelte';
import { signOut as cognitoSignOut } from '$lib/auth/cognito';

/**
 * Sign out the user and redirect to login
 */
export function signOutAndRedirect() {
	cognitoSignOut();
	authStore.clear();
	goto('/login');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
	return authStore.isAuthenticated;
}

/**
 * Get current user's ID token
 */
export function getIdToken(): string | null {
	if (!authStore.session) return null;
	return authStore.session.getIdToken().getJwtToken();
}

/**
 * Get current user's access token
 */
export function getAccessToken(): string | null {
	if (!authStore.session) return null;
	return authStore.session.getAccessToken().getJwtToken();
}

/**
 * Get current user's email from token
 */
export function getUserEmail(): string | null {
	if (!authStore.session) return null;
	const payload = authStore.session.getIdToken().payload;
	return payload.email || null;
}
