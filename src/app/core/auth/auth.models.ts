export type UserRolePreset = 'guest' | 'viewer' | 'trusted' | 'admin';

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface RegisterRequest {
  readonly email: string;
  readonly fullName: string;
  readonly password: string;
}

export interface AuthResponse {
  readonly token: string;
  readonly userId: string;
  readonly email: string;
  readonly fullName: string;
  readonly role: string;
  readonly expiresAt: string;
}

export interface UserResponse {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly role: string;
}

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
  readonly fullName: string;
  readonly role: string;
  readonly isAdmin: boolean;
  readonly isTrustedMember: boolean;
  readonly rolePreset: UserRolePreset;
  readonly expiresAt: number;
}
