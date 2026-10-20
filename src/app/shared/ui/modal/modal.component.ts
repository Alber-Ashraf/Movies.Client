import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="modal-backdrop" (click)="onBackdropClick($event)" role="dialog" [attr.aria-label]="title()">
        <div class="modal-surface" (click)="$event.stopPropagation()">
          <header class="modal-header">
            <h2 class="modal-title">{{ title() }}</h2>
            <button
              type="button"
              class="modal-close"
              (click)="closed.emit()"
              aria-label="Close dialog"
            >
              ✕
            </button>
          </header>

          <div class="modal-body">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 80;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .modal-surface {
      width: 100%;
      max-width: 540px;
      background: var(--bg-surface);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      animation: modalEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modalEnter {
      from {
        opacity: 0;
        transform: scale(0.96) translateY(8px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .modal-title {
      font-size: 1.25rem;
      margin: 0;
    }

    .modal-close {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      font-size: 0.95rem;
      transition: all var(--transition-fast);
    }

    .modal-close:hover {
      background: var(--bg-surface-hover);
      color: var(--text-primary);
    }

    .modal-body {
      padding: 24px;
      max-height: calc(85vh - 80px);
      overflow-y: auto;
    }
  `],
})
export class ModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly title = input.required<string>();

  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.closed.emit();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }
}
