import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { APP_CONFIG } from '../config/app.config.token';
import {
  AuthResponse,
  AuthSession,
  LoginRequest,
  RegisterRequest,
  UserRolePreset,
} from './auth.models';

const STORAGE_KEY = 'cinemovies_auth_session_v2';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  private readonly _session = signal<AuthSession | null>(this.loadStoredSession());
  private readonly _isAuthModalOpen = signal<boolean>(false);
  private readonly _authModalMode = signal<'login' | 'register'>('login');
  private readonly _isSubmitting = signal<boolean>(false);

  readonly session = this._session.asReadonly();
  readonly isAuthModalOpen = this._isAuthModalOpen.asReadonly();
  readonly authModalMode = this._authModalMode.asReadonly();
  readonly isSubmitting = this._isSubmitting.asReadonly();

  readonly isAuthenticated = computed(() => {
    const current = this._session();
    return current !== null && current.expiresAt > Date.now();
  });

  readonly isAdmin = computed(() => this.isAuthenticated() && (this._session()?.isAdmin ?? false));

  readonly isTrustedMember = computed(
    () => this.isAuthenticated() && (this._session()?.isTrustedMember ?? false)
  );

  readonly canManageMovies = computed(() => this.isAdmin() || this.isTrustedMember());

  readonly activeRolePreset = computed<UserRolePreset>(() => {
    if (!this.isAuthenticated()) {
      return 'guest';
    }
    return this._session()?.rolePreset ?? 'viewer';
  });

  readonly token = computed(() => (this.isAuthenticated() ? this._session()?.token ?? null : null));

  openAuthModal(mode: 'login' | 'register' = 'login'): void {
    this._authModalMode.set(mode);
    this._isAuthModalOpen.set(true);
  }

  closeAuthModal(): void {
    this._isAuthModalOpen.set(false);
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    this._isSubmitting.set(true);
    return this.http
      .post<AuthResponse>(`${this.config.apiBaseUrl}/identity/login`, request)
      .pipe(
        tap({
          next: (res) => {
            this.applyAuthResponse(res);
            this._isSubmitting.set(false);
            this.closeAuthModal();
          },
          error: () => {
            this._isSubmitting.set(false);
          },
        })
      );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    this._isSubmitting.set(true);
    return this.http
      .post<AuthResponse>(`${this.config.apiBaseUrl}/identity/register`, request)
      .pipe(
        tap({
          next: (res) => {
            this.applyAuthResponse(res);
            this._isSubmitting.set(false);
            this.closeAuthModal();
          },
          error: () => {
            this._isSubmitting.set(false);
          },
        })
      );
  }

  logout(): void {
    this._session.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }

  private applyAuthResponse(res: AuthResponse): void {
    const roleLower = res.role.toLowerCase();
    const isAdmin = roleLower === 'admin';
    const isTrusted = isAdmin || roleLower === 'trustedmember' || roleLower === 'trusted_member';
    const preset: UserRolePreset = isAdmin ? 'admin' : isTrusted ? 'trusted' : 'viewer';
    const expiresAtMs = res.expiresAt
      ? new Date(res.expiresAt).getTime()
      : Date.now() + 7.5 * 60 * 60 * 1000;

    const newSession: AuthSession = {
      token: res.token,
      userId: res.userId,
      email: res.email,
      fullName: res.fullName,
      role: res.role,
      isAdmin,
      isTrustedMember: isTrusted,
      rolePreset: preset,
      expiresAt: expiresAtMs,
    };

    this._session.set(newSession);
    this.saveSession(newSession);
  }

  private loadStoredSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AuthSession;
      if (parsed.expiresAt <= Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private saveSession(session: AuthSession): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Ignore storage errors
    }
  }
}
