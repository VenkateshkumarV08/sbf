import {
	CognitoUserPool,
	CognitoUser,
	AuthenticationDetails,
	type CognitoUserSession,
	type IAuthenticationCallback
} from 'amazon-cognito-identity-js';
import {
	PUBLIC_COGNITO_USER_POOL_ID,
	PUBLIC_COGNITO_CLIENT_ID
} from '$env/static/public';
import type { AuthResult, NewPasswordRequiredData } from '$lib/types/auth';

const poolData = {
	UserPoolId: PUBLIC_COGNITO_USER_POOL_ID,
	ClientId: PUBLIC_COGNITO_CLIENT_ID
};

export const userPool = new CognitoUserPool(poolData);

export async function authenticateUser(
	email: string,
	password: string
): Promise<AuthResult & { newPasswordData?: NewPasswordRequiredData }> {
	return new Promise((resolve) => {
		const authenticationData = {
			Username: email,
			Password: password
		};

		const authenticationDetails = new AuthenticationDetails(authenticationData);

		const userData = {
			Username: email,
			Pool: userPool
		};

		const cognitoUser = new CognitoUser(userData);

		const callbacks: IAuthenticationCallback = {
			onSuccess: (session: CognitoUserSession) => {
				resolve({
					success: true,
					session,
					message: 'Login successful!'
				});
			},

			onFailure: (err: Error) => {
				resolve({
					success: false,
					message: err.message || 'Login failed'
				});
			},

			newPasswordRequired: (userAttributes: any, requiredAttributes: any) => {
				resolve({
					success: false,
					requiresNewPassword: true,
					message: 'Please set a new password',
					newPasswordData: {
						userAttributes,
						requiredAttributes,
						cognitoUser
					}
				});
			}
		};

		cognitoUser.authenticateUser(authenticationDetails, callbacks);
	});
}

export async function completeNewPasswordChallenge(
	cognitoUser: CognitoUser,
	newPassword: string
): Promise<AuthResult> {
	return new Promise((resolve) => {
		cognitoUser.completeNewPasswordChallenge(
			newPassword,
			{},
			{
				onSuccess: (session: CognitoUserSession) => {
					resolve({
						success: true,
						session,
						message: 'Password set successfully!'
					});
				},
				onFailure: (err: Error) => {
					resolve({
						success: false,
						message: err.message || 'Failed to set password'
					});
				}
			}
		);
	});
}

export function getCurrentUser() {
	return userPool.getCurrentUser();
}

export async function getCurrentSession(): Promise<CognitoUserSession | null> {
	const cognitoUser = getCurrentUser();
	if (!cognitoUser) return null;

	return new Promise((resolve) => {
		cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
			if (err || !session) {
				resolve(null);
			} else {
				// Session is automatically refreshed if needed by getSession
				resolve(session);
			}
		});
	});
}

export async function refreshSession(): Promise<CognitoUserSession | null> {
	return getCurrentSession();
}

export function signOut() {
	const cognitoUser = getCurrentUser();
	if (cognitoUser) {
		cognitoUser.signOut();
	}
}
