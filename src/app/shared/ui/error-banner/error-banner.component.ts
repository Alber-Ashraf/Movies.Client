import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="error-banner" role="alert">
      <div class="error-icon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>

      <div class="error-content">
        <div class="error-message">{{ message() }}</div>
        @if (hint()) {
          <div class="error-hint">{{ hint() }}</div>
        }
      </div>

      @if (showRetry()) {
        <button type="button" class="btn-retry" (click)="retryClicked.emit()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          Retry
        </button>
      }
    </div>
  `,
  styles: [`
    .error-banner {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 20px;
      margin: 16px 0;
      border-radius: var(--radius-md);
      background: var(--color-danger-bg);
      border: 1px solid rgba(255, 77, 79, 0.3);
      color: var(--text-primary);
    }

    .error-icon {
      color: var(--color-danger);
      flex-shrink: 0;
      display: flex;
    }

    .error-content {
      flex: 1;
    }

    .error-message {
      font-weight: 600;
      font-size: 0.92rem;
    }

    .error-hint {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .btn-retry {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: var(--radius-sm);
      background: var(--bg-surface-elevated);
      color: var(--text-primary);
      border: 1px solid var(--border-medium);
      font-size: 0.82rem;
      font-weight: 600;
      transition: all var(--transition-fast);
      flex-shrink: 0;
    }

    .btn-retry:hover {
      background: var(--bg-surface-hover);
      color: var(--color-danger);
      border-color: var(--color-danger);
    }
  `],
})
export class ErrorBannerComponent {
  readonly message = input.required<string>();
  readonly hint = input<string | null>(null);
  readonly showRetry = input<boolean>(true);

  readonly retryClicked = output<void>();
}
