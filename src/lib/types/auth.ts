import type { CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';

export interface AuthResult {
	success: boolean;
	message?: string;
	requiresNewPassword?: boolean;
	session?: CognitoUserSession;
}

export interface NewPasswordRequiredData {
	userAttributes: Record<string, any>;
	requiredAttributes: string[];
	cognitoUser: CognitoUser;
}

export interface AuthState {
	isAuthenticated: boolean;
	session: CognitoUserSession | null;
	loading: boolean;
}

export interface LoginFormData {
	email: string;
	password: string;
}

export interface CognitoConfig {
	userPoolId: string;
	clientId: string;
	region: string;
}
