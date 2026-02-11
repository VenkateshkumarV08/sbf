import { LexRuntimeV2Client, RecognizeTextCommand } from '@aws-sdk/client-lex-runtime-v2';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import {
	PUBLIC_COGNITO_REGION,
	PUBLIC_COGNITO_USER_POOL_ID,
	PUBLIC_COGNITO_IDENTITY_POOL_ID,
	PUBLIC_BOT_ID,
	PUBLIC_BOT_ALIAS_ID,
	PUBLIC_BOT_LOCALE_ID
} from '$env/static/public';
import type { CognitoUserSession } from 'amazon-cognito-identity-js';

export interface ImageResponseCardButton {
	text: string;
	value: string;
}

export interface ImageResponseCard {
	title: string;
	subtitle?: string;
	imageUrl?: string;
	buttons?: ImageResponseCardButton[];
}

export interface LexMessage {
	content?: string;
	contentType?: string;
	imageResponseCard?: ImageResponseCard;
}

export interface LexResponse {
	messages: LexMessage[];
	sessionState?: any;
}

let lexClient: LexRuntimeV2Client | null = null;

export function initializeLexClient(session: CognitoUserSession) {
	const idToken = session.getIdToken().getJwtToken();

	const credentials = fromCognitoIdentityPool({
		client: new CognitoIdentityClient({ region: PUBLIC_COGNITO_REGION }),
		identityPoolId: PUBLIC_COGNITO_IDENTITY_POOL_ID,
		logins: {
			[`cognito-idp.${PUBLIC_COGNITO_REGION}.amazonaws.com/${PUBLIC_COGNITO_USER_POOL_ID}`]:
				idToken
		}
	});

	lexClient = new LexRuntimeV2Client({
		region: PUBLIC_COGNITO_REGION,
		credentials
	});

	return lexClient;
}

export async function sendMessageToLex(
	text: string,
	sessionId: string
): Promise<LexResponse> {
	if (!lexClient) {
		throw new Error('Lex client not initialized');
	}

	const command = new RecognizeTextCommand({
		botId: PUBLIC_BOT_ID,
		botAliasId: PUBLIC_BOT_ALIAS_ID,
		localeId: PUBLIC_BOT_LOCALE_ID,
		sessionId,
		text
	});

	const response = await lexClient.send(command);

	return {
		messages: response.messages || [],
		sessionState: response.sessionState
	};
}

export function generateSessionId(): string {
	return `web-ui-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
