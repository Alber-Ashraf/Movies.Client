import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ModalComponent } from './modal.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal [isOpen]="isOpen()" [title]="title()" (closed)="cancelled.emit()">
      <div class="confirm-body">
        <p class="confirm-message">{{ message() }}</p>

        <footer class="confirm-actions">
          <button
            type="button"
            class="btn-cancel"
            [disabled]="isProcessing()"
            (click)="cancelled.emit()"
          >
            {{ cancelLabel() }}
          </button>
          <button
            type="button"
            class="btn-confirm"
            [disabled]="isProcessing()"
            (click)="confirmed.emit()"
          >
            {{ isProcessing() ? 'Deleting...' : confirmLabel() }}
          </button>
        </footer>
      </div>
    </app-modal>
  `,
  styles: [`
    .confirm-body {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .confirm-message {
      color: var(--text-secondary);
      font-size: 0.95rem;
      line-height: 1.6;
    }

    .confirm-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding-top: 14px;
      border-top: 1px solid var(--border-subtle);
    }

    .btn-cancel {
      padding: 9px 18px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.88rem;
      transition: all var(--transition-fast);
    }

    .btn-cancel:hover:not(:disabled) {
      background: var(--bg-surface-hover);
      color: var(--text-primary);
    }

    .btn-confirm {
      padding: 9px 20px;
      border-radius: var(--radius-md);
      background: var(--color-danger);
      color: #ffffff;
      font-weight: 700;
      font-size: 0.88rem;
      transition: all var(--transition-fast);
    }

    .btn-confirm:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .btn-confirm:disabled,
    .btn-cancel:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
  `],
})
export class ConfirmDialogComponent {
  readonly isOpen = input<boolean>(false);
  readonly title = input<string>('Confirm Action');
  readonly message = input.required<string>();
  readonly confirmLabel = input<string>('Delete');
  readonly cancelLabel = input<string>('Cancel');
  readonly isProcessing = input<boolean>(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
