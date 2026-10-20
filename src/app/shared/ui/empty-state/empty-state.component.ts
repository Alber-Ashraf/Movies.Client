import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state-box">
      <div class="icon-bubble" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>
          <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
          <circle cx="16" cy="16" r="1.5" fill="currentColor"/>
        </svg>
      </div>

      <h3 class="empty-title">{{ title() }}</h3>
      <p class="empty-desc">{{ description() }}</p>

      @if (actionLabel()) {
        <button type="button" class="empty-cta" (click)="actionClicked.emit()">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 64px 24px;
      margin: 20px 0;
      border: 1px dashed var(--border-medium);
      border-radius: var(--radius-lg);
      background: var(--bg-surface);
    }

    .icon-bubble {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 72px;
      height: 72px;
      border-radius: var(--radius-full);
      background: var(--bg-surface-elevated);
      color: var(--accent-gold);
      margin-bottom: 20px;
      border: 1px solid var(--border-subtle);
    }

    .empty-title {
      font-size: 1.25rem;
      margin-bottom: 8px;
    }

    .empty-desc {
      color: var(--text-muted);
      max-width: 440px;
      font-size: 0.94rem;
      margin-bottom: 24px;
    }

    .empty-cta {
      display: inline-flex;
      align-items: center;
      padding: 10px 20px;
      border-radius: var(--radius-md);
      background: var(--accent-gold);
      color: var(--text-on-accent);
      font-weight: 600;
      font-size: 0.9rem;
      transition: all var(--transition-fast);
      box-shadow: 0 4px 14px var(--accent-gold-glow);
    }

    .empty-cta:hover {
      background: var(--accent-gold-hover);
      transform: translateY(-1px);
    }
  `],
})
export class EmptyStateComponent {
  readonly title = input<string>('No movies found');
  readonly description = input<string>('Try adjusting your search criteria, clearing genre filters, or adding a new movie.');
  readonly actionLabel = input<string | null>(null);

  readonly actionClicked = output<void>();
}
