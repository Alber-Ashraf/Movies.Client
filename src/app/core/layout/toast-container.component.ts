import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-stack" aria-live="polite" aria-atomic="true">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [attr.data-variant]="toast.variant" role="status">
          <span class="toast-text">{{ toast.text }}</span>
          <button
            type="button"
            class="toast-close"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-stack {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 90;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 380px;
      pointer-events: none;
    }

    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-medium);
      box-shadow: var(--shadow-lg);
      color: var(--text-primary);
      font-size: 0.88rem;
      font-weight: 500;
    }

    .toast-item[data-variant='success'] {
      border-left: 4px solid var(--color-success);
    }

    .toast-item[data-variant='error'] {
      border-left: 4px solid var(--color-danger);
    }

    .toast-item[data-variant='info'] {
      border-left: 4px solid var(--accent-gold);
    }

    .toast-close {
      font-size: 0.78rem;
      color: var(--text-muted);
      padding: 2px 6px;
      border-radius: var(--radius-sm);
    }

    .toast-close:hover {
      color: var(--text-primary);
      background: var(--bg-surface-hover);
    }
  `],
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}
