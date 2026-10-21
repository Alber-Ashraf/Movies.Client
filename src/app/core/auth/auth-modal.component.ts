import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../shared/ui/modal/modal.component';
import { ApiError } from '../models/api-error.model';
import { ToastService } from '../layout/toast.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal
      [isOpen]="auth.isAuthModalOpen()"
      [title]="mode() === 'login' ? 'Sign In to CineMovies' : 'Create Enterprise Account'"
      (closed)="auth.closeAuthModal()"
    >
      <!-- Mode Tabs -->
      <div class="auth-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          class="auth-tab"
          [class.active]="mode() === 'login'"
          (click)="switchMode('login')"
        >
          Sign In
        </button>
        <button
          type="button"
          role="tab"
          class="auth-tab"
          [class.active]="mode() === 'register'"
          (click)="switchMode('register')"
        >
          Create Account
        </button>
      </div>

      @if (apiError(); as err) {
        <div class="auth-error-alert" role="alert">
          <div class="alert-title">{{ err.message }}</div>
          @if (fieldErrorList().length > 0) {
            <ul class="alert-list">
              @for (msg of fieldErrorList(); track msg) {
                <li>{{ msg }}</li>
              }
            </ul>
          }
        </div>
      }

      @if (mode() === 'login') {
        <form [formGroup]="loginForm" (ngSubmit)="onSubmitLogin()" class="auth-form" novalidate>
          <div class="form-field">
            <label for="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              formControlName="email"
              placeholder="name@cinemovies.io"
              autocomplete="email"
            />
          </div>

          <div class="form-field">
            <label for="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              formControlName="password"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </div>

          <button
            type="submit"
            class="btn-submit-auth"
            [disabled]="auth.isSubmitting() || loginForm.invalid"
          >
            {{ auth.isSubmitting() ? 'Authenticating...' : 'Sign In' }}
          </button>
        </form>

        <!-- Enterprise Demo Quick Access -->
        <div class="demo-credentials-box">
          <div class="demo-header">
            <span class="demo-title">Seeded Enterprise Accounts</span>
            <span class="demo-badge">1-Click Sign In</span>
          </div>
          <div class="demo-accounts-grid">
            <button
              type="button"
              class="demo-account-btn"
              [disabled]="auth.isSubmitting()"
              (click)="loginWithPreset('admin@cinemovies.io', 'Admin123!')"
            >
              <span class="role-dot admin"></span>
              <div class="demo-meta">
                <strong>Administrator</strong>
                <span>Full CRUD & Seeder</span>
              </div>
            </button>

            <button
              type="button"
              class="demo-account-btn"
              [disabled]="auth.isSubmitting()"
              (click)="loginWithPreset('critic@cinemovies.io', 'Critic123!')"
            >
              <span class="role-dot trusted"></span>
              <div class="demo-meta">
                <strong>Trusted Critic</strong>
                <span>Edit & Rate Films</span>
              </div>
            </button>

            <button
              type="button"
              class="demo-account-btn"
              [disabled]="auth.isSubmitting()"
              (click)="loginWithPreset('member@cinemovies.io', 'Member123!')"
            >
              <span class="role-dot member"></span>
              <div class="demo-meta">
                <strong>Member</strong>
                <span>Rate & Track Films</span>
              </div>
            </button>
          </div>
        </div>
      } @else {
        <form [formGroup]="registerForm" (ngSubmit)="onSubmitRegister()" class="auth-form" novalidate>
          <div class="form-field">
            <label for="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              formControlName="fullName"
              placeholder="Alex Mercer"
              autocomplete="name"
            />
          </div>

          <div class="form-field">
            <label for="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              formControlName="email"
              placeholder="alex@cinemovies.io"
              autocomplete="email"
            />
          </div>

          <div class="form-field">
            <label for="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              formControlName="password"
              placeholder="Min 8 chars, 1 uppercase, 1 digit"
              autocomplete="new-password"
            />
            <span class="field-hint">
              Must be at least 8 characters and include uppercase, lowercase, and a number.
            </span>
          </div>

          <button
            type="submit"
            class="btn-submit-auth"
            [disabled]="auth.isSubmitting() || registerForm.invalid"
          >
            {{ auth.isSubmitting() ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>
      }
    </app-modal>
  `,
  styles: [`
    .auth-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      padding: 4px;
      border-radius: var(--radius-md);
      background: var(--bg-canvas);
      border: 1px solid var(--border-subtle);
      margin-bottom: 18px;
    }

    .auth-tab {
      padding: 9px 14px;
      border-radius: var(--radius-sm);
      font-size: 0.86rem;
      font-weight: 600;
      color: var(--text-secondary);
      transition: all var(--transition-fast);
    }

    .auth-tab.active {
      background: var(--bg-surface-elevated);
      color: var(--accent-gold);
      box-shadow: var(--shadow-sm);
    }

    .auth-error-alert {
      padding: 12px 14px;
      border-radius: var(--radius-md);
      background: var(--color-danger-bg);
      border: 1px solid rgba(255, 77, 79, 0.35);
      color: var(--color-danger);
      font-size: 0.85rem;
      margin-bottom: 16px;
    }

    .alert-title {
      font-weight: 600;
    }

    .alert-list {
      margin: 6px 0 0 18px;
      padding: 0;
      font-size: 0.8rem;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-field label {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .form-field input {
      padding: 10px 14px;
      border-radius: var(--radius-md);
      background: var(--bg-canvas);
      border: 1px solid var(--border-medium);
      color: var(--text-primary);
      font-size: 0.92rem;
      transition: border-color var(--transition-fast);
    }

    .form-field input:focus {
      outline: none;
      border-color: var(--accent-gold);
    }

    .field-hint {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .btn-submit-auth {
      margin-top: 6px;
      padding: 11px 18px;
      border-radius: var(--radius-md);
      background: var(--accent-gold);
      color: var(--text-on-accent);
      font-weight: 700;
      font-size: 0.92rem;
      transition: all var(--transition-fast);
    }

    .btn-submit-auth:hover:not(:disabled) {
      background: var(--accent-gold-hover);
      transform: translateY(-1px);
    }

    .btn-submit-auth:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .demo-credentials-box {
      margin-top: 22px;
      padding-top: 18px;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .demo-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .demo-title {
      font-size: 0.76rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      font-weight: 700;
    }

    .demo-badge {
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      background: var(--accent-gold-subtle);
      color: var(--accent-gold);
      font-weight: 600;
    }

    .demo-accounts-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .demo-account-btn {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 10px;
      border-radius: var(--radius-md);
      background: var(--bg-canvas);
      border: 1px solid var(--border-subtle);
      text-align: left;
      transition: all var(--transition-fast);
    }

    .demo-account-btn:hover:not(:disabled) {
      border-color: var(--accent-gold);
      background: var(--bg-surface-elevated);
    }

    .role-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-top: 5px;
      flex-shrink: 0;
    }

    .role-dot.admin {
      background: var(--accent-gold);
    }

    .role-dot.trusted {
      background: var(--color-success);
    }

    .role-dot.member {
      background: var(--color-info);
    }

    .demo-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .demo-meta strong {
      font-size: 0.78rem;
      color: var(--text-primary);
    }

    .demo-meta span {
      font-size: 0.68rem;
      color: var(--text-muted);
    }

    @media (max-width: 560px) {
      .demo-accounts-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class AuthModalComponent {
  readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly authenticated = output<void>();

  protected readonly mode = signal<'login' | 'register'>('login');
  protected readonly apiError = signal<ApiError | null>(null);
  protected readonly fieldErrorList = computed(() => {
    const err = this.apiError();
    if (!err || !err.fieldErrors) return [];
    return Object.values(err.fieldErrors);
  });

  protected readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected readonly registerForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    effect(() => {
      if (this.auth.isAuthModalOpen()) {
        this.mode.set(this.auth.authModalMode());
        this.apiError.set(null);
      }
    });
  }

  switchMode(nextMode: 'login' | 'register'): void {
    this.mode.set(nextMode);
    this.apiError.set(null);
  }

  onSubmitLogin(): void {
    if (this.loginForm.invalid) return;
    this.apiError.set(null);

    const { email, password } = this.loginForm.getRawValue();
    this.auth.login({ email, password }).subscribe({
      next: (res) => {
        this.toast.show(`Welcome back, ${res.fullName} (${res.role}).`, 'success');
        this.loginForm.reset();
        this.authenticated.emit();
      },
      error: (err: ApiError) => {
        this.apiError.set(err);
      },
    });
  }

  loginWithPreset(email: string, password: string): void {
    this.loginForm.setValue({ email, password });
    this.onSubmitLogin();
  }

  onSubmitRegister(): void {
    if (this.registerForm.invalid) return;
    this.apiError.set(null);

    const { fullName, email, password } = this.registerForm.getRawValue();
    this.auth.register({ fullName, email, password }).subscribe({
      next: (res) => {
        this.toast.show(`Account created! Signed in as ${res.fullName}.`, 'success');
        this.registerForm.reset();
        this.authenticated.emit();
      },
      error: (err: ApiError) => {
        this.apiError.set(err);
      },
    });
  }
}
