import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeVariant = 'genre' | 'gold' | 'danger' | 'info' | 'neutral';

@Component({
  selector: 'app-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="badge" [attr.data-variant]="variant()">
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 9px;
      border-radius: var(--radius-full);
      font-size: 0.76rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      line-height: 1.25;
      white-space: nowrap;
    }

    .badge[data-variant='genre'] {
      background: var(--bg-surface-elevated);
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
    }

    .badge[data-variant='gold'] {
      background: var(--accent-gold-subtle);
      color: var(--accent-gold);
      border: 1px solid var(--accent-gold-glow);
    }

    .badge[data-variant='danger'] {
      background: var(--color-danger-bg);
      color: var(--color-danger);
    }

    .badge[data-variant='info'] {
      background: var(--color-info-bg);
      color: var(--color-info);
    }

    .badge[data-variant='neutral'] {
      background: var(--bg-surface-hover);
      color: var(--text-muted);
    }
  `],
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('genre');
}
