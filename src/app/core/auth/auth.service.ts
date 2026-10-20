import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { APP_CONFIG } from '../config/app.config.token';
import { AuthSession, TokenGenerationRequest, TokenResponse, UserRolePreset } from './auth.models';

const STORAGE_KEY = 'cinemovies_auth_session_v1';
const DEFAULT_USER_ID = 'b9787b32-8558-4a34-9c43-095b1280c790';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  private readonly _session = signal<AuthSession | null>(this.loadStoredSession());
  private readonly _isSwitchingRole = signal<boolean>(false);

  readonly session = this._session.asReadonly();
  readonly isSwitchingRole = this._isSwitchingRole.asReadonly();

  readonly isAuthenticated = computed(() => {
    const current = this._session();
    return current !== null && current.expiresAt > Date.now();
  });

  readonly isAdmin = computed(() => this.isAuthenticated() && (this._session()?.isAdmin ?? false));

  readonly isTrustedMember = computed(
    () => this.isAuthenticated() && (this._session()?.isTrustedMember ?? false)
  );

  readonly activeRolePreset = computed<UserRolePreset>(() => {
    if (!this.isAuthenticated()) {
      return 'guest';
    }
    return this._session()?.rolePreset ?? 'viewer';
  });

  readonly token = computed(() => (this.isAuthenticated() ? this._session()?.token ?? null : null));

  switchRolePreset(preset: UserRolePreset, customEmail?: string): Observable<TokenResponse> | null {
    if (preset === 'guest') {
      this.logout();
      return null;
    }

    const email =
      customEmail ??
      (preset === 'admin'
        ? 'admin@cinemovies.io'
        : preset === 'trusted'
          ? 'critic@cinemovies.io'
          : 'member@cinemovies.io');

    const customClaims: Record<string, boolean> = {};
    if (preset === 'admin') {
      customClaims['admin'] = true;
      customClaims['trusted_member'] = true;
    } else if (preset === 'trusted') {
      customClaims['trusted_member'] = true;
    }

    const payload: TokenGenerationRequest = {
      userId: DEFAULT_USER_ID,
      email,
      customClaims,
    };

    this._isSwitchingRole.set(true);
    return this.http.post<TokenResponse>(`${this.config.apiBaseUrl}/identity/token`, payload).pipe(
      tap({
        next: (res) => {
          const newSession: AuthSession = {
            token: res.token,
            userId: DEFAULT_USER_ID,
            email,
            isAdmin: preset === 'admin',
            isTrustedMember: preset === 'admin' || preset === 'trusted',
            rolePreset: preset,
            expiresAt: Date.now() + 3.5 * 60 * 60 * 1000,
          };
          this._session.set(newSession);
          this.saveSession(newSession);
          this._isSwitchingRole.set(false);
        },
        error: () => {
          this._isSwitchingRole.set(false);
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
