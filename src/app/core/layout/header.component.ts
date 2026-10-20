import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { UserRolePreset } from '../auth/auth.models';
import { ThemeService } from './theme.service';
import { ToastService } from './toast.service';
import { LoadingService } from '../http/loading.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="app-header">
      @if (loadingService.isLoading()) {
        <div class="top-loading-bar" role="progressbar" aria-label="Loading"></div>
      }

      <div class="header-container">
        <!-- Brand Logo -->
        <a routerLink="/movies" class="brand" aria-label="CineMovies Home">
          <span class="brand-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" stroke-width="2"/>
              <path d="M7 4V20M17 4V20M2 9H7M17 9H22M2 15H7M17 15H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
            </svg>
          </span>
          <span class="brand-text">CINE<span class="brand-accent">MOVIES</span></span>
        </a>

        <!-- Main Navigation Links -->
        <nav class="nav-links" aria-label="Primary Navigation">
          <a
            routerLink="/movies"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="nav-item"
          >
            Catalog
          </a>

          @if (authService.isAuthenticated()) {
            <a routerLink="/ratings/me" routerLinkActive="active" class="nav-item">
              My Ratings
            </a>
          }
        </nav>

        <!-- Actions & Identity Switcher -->
        <div class="header-actions">
          <!-- Role Switcher Pills -->
          <div class="role-switcher" role="group" aria-label="Identity Role Switcher">
            <span class="role-label">Identity:</span>
            @for (role of roles; track role.id) {
              <button
                type="button"
                class="role-pill"
                [class.active]="authService.activeRolePreset() === role.id"
                [disabled]="authService.isSwitchingRole()"
                (click)="onSelectRole(role.id, role.label)"
                [title]="role.hint"
              >
                <span class="status-dot" [attr.data-role]="role.id"></span>
                {{ role.label }}
              </button>
            }
          </div>

          <!-- New Movie CTA (Admin Only) -->
          @if (authService.isAdmin()) {
            <button
              type="button"
              class="btn-create-movie"
              (click)="createMovieRequested.emit()"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
              </svg>
              <span>Add Movie</span>
            </button>
          }

          <!-- Theme Toggle -->
          <button
            type="button"
            class="theme-toggle"
            (click)="themeService.toggleTheme()"
            [attr.aria-label]="themeService.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
            [title]="themeService.theme() === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            @if (themeService.theme() === 'dark') {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            } @else {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            }
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      position: sticky;
      top: 0;
      z-index: 40;
      background: var(--bg-glass);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-subtle);
    }

    .top-loading-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--accent-gold), transparent);
      background-size: 200% 100%;
      animation: shimmer 1.2s infinite linear;
    }

    .header-container {
      max-width: 1360px;
      margin: 0 auto;
      padding: 0 24px;
      height: 68px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 1.2rem;
      letter-spacing: -0.03em;
      color: var(--text-primary);
    }

    .brand-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: var(--accent-gold-subtle);
      color: var(--accent-gold);
      border: 1px solid var(--border-focus);
    }

    .brand-accent {
      color: var(--accent-gold);
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .nav-item {
      padding: 8px 14px;
      border-radius: var(--radius-md);
      font-size: 0.92rem;
      font-weight: 500;
      color: var(--text-secondary);
      transition: all var(--transition-fast);
    }

    .nav-item:hover {
      color: var(--text-primary);
      background: var(--bg-surface-elevated);
    }

    .nav-item.active {
      color: var(--accent-gold);
      background: var(--accent-gold-subtle);
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .role-switcher {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-full);
    }

    .role-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      padding: 0 8px 0 10px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .role-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 11px;
      border-radius: var(--radius-full);
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-secondary);
      transition: all var(--transition-fast);
    }

    .role-pill:hover:not(:disabled) {
      color: var(--text-primary);
      background: var(--bg-surface-elevated);
    }

    .role-pill.active {
      background: var(--bg-surface-hover);
      color: var(--text-primary);
      font-weight: 600;
      box-shadow: var(--shadow-sm);
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--text-muted);
    }

    .status-dot[data-role='viewer'] {
      background: var(--color-info);
    }

    .status-dot[data-role='trusted'] {
      background: var(--color-success);
    }

    .status-dot[data-role='admin'] {
      background: var(--accent-gold);
    }

    .btn-create-movie {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: var(--radius-md);
      background: var(--accent-gold);
      color: var(--text-on-accent);
      font-weight: 600;
      font-size: 0.86rem;
      transition: all var(--transition-fast);
      box-shadow: 0 2px 10px var(--accent-gold-glow);
    }

    .btn-create-movie:hover {
      background: var(--accent-gold-hover);
      transform: translateY(-1px);
    }

    .theme-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      transition: all var(--transition-fast);
    }

    .theme-toggle:hover {
      color: var(--accent-gold);
      border-color: var(--border-medium);
      background: var(--bg-surface-elevated);
    }

    @media (max-width: 820px) {
      .role-label {
        display: none;
      }
      .header-container {
        padding: 0 16px;
        height: auto;
        min-height: 64px;
        flex-wrap: wrap;
        padding-top: 10px;
        padding-bottom: 10px;
      }
    }
  `],
})
export class AppHeaderComponent {
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  readonly loadingService = inject(LoadingService);
  private readonly toastService = inject(ToastService);

  readonly createMovieRequested = output<void>();
  readonly roleChanged = output<UserRolePreset>();

  readonly roles: ReadonlyArray<{ id: UserRolePreset; label: string; hint: string }> = [
    { id: 'guest', label: 'Guest', hint: 'Browse public catalog only' },
    { id: 'viewer', label: 'Member', hint: 'Authenticated user — can rate movies' },
    { id: 'trusted', label: 'Trusted', hint: 'Trusted member claim enabled' },
    { id: 'admin', label: 'Admin', hint: 'Full CRUD + Rating permissions' },
  ];

  onSelectRole(role: UserRolePreset, label: string): void {
    if (this.authService.activeRolePreset() === role) return;

    const req$ = this.authService.switchRolePreset(role);
    if (!req$) {
      this.toastService.show('Switched to Guest mode (anonymous).', 'info');
      this.roleChanged.emit('guest');
      return;
    }

    req$.subscribe({
      next: () => {
        this.toastService.show(`Signed in with ${label} JWT token.`, 'success');
        this.roleChanged.emit(role);
      },
      error: (err: { message?: string }) => {
        this.toastService.show(
          err.message ?? 'Could not acquire JWT token from backend.',
          'error'
        );
      },
    });
  }
}
