export type UserRolePreset = 'guest' | 'viewer' | 'trusted' | 'admin';

export interface TokenGenerationRequest {
  readonly userId?: string;
  readonly email: string;
  readonly customClaims: Record<string, boolean | string | number>;
}

export interface TokenResponse {
  readonly token: string;
}

export interface AuthSession {
  readonly token: string;
  readonly userId: string;
  readonly email: string;
  readonly isAdmin: boolean;
  readonly isTrustedMember: boolean;
  readonly rolePreset: UserRolePreset;
  readonly expiresAt: number;
}
