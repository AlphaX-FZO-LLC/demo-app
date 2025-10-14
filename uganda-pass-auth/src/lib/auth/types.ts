export interface AuthenticationResult {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
  authMethod: string;
  zkpProofId: string;
  user: {
    entityId: string;
    email?: string;
    displayName?: string;
  };
}

export interface OAuth2Context {
  type: 'oauth2';
  clientId: string;
  redirectUri: string;
  state?: string;
  responseType?: string;
  partnerSessionId?: string;
}

export interface DirectContext {
  type: 'direct';
}

export type LoginContext = OAuth2Context | DirectContext;

export interface DigitalPassInitiateResponse {
  access_token: string;
  challenge_number: number;
  expires_in: number;
  challenge_id: string;
  session_id: string; // Still included for backward compatibility
}

export interface DigitalPassSession {
  status: 'pending' | 'verified' | 'failed' | 'expired';
  attemptsRemaining: number;
  expiresAt: string;
}

import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser';

export interface WebAuthnAuthenticationOptions {
  challengeId: string;
  options: PublicKeyCredentialRequestOptionsJSON; // WebAuthn options from backend
}

export interface SSEEvent {
  type: 'status' | 'redirect' | 'tokens' | 'error';
  status?: string;
  attemptsRemaining?: number;
  expiresAt?: string;
  redirect_uri?: string;
  code?: string;
  state?: string;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    entityId: string;
    email?: string;
    displayName?: string;
  };
  timestamp?: string;
}