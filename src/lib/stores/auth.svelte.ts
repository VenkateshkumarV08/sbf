import type { CognitoUserSession } from 'amazon-cognito-identity-js';

export interface AuthState {
	isAuthenticated: boolean;
	session: CognitoUserSession | null;
	loading: boolean;
}

class AuthStore {
	isAuthenticated = $state(false);
	session = $state<CognitoUserSession | null>(null);
	loading = $state(true);

	setSession(session: CognitoUserSession | null) {
		this.session = session;
		this.isAuthenticated = !!session;
		this.loading = false;
	}

	setLoading(loading: boolean) {
		this.loading = loading;
	}

	clear() {
		this.isAuthenticated = false;
		this.session = null;
		this.loading = false;
	}
}

export const authStore = new AuthStore();
