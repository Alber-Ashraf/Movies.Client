import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-movie-card-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="skeleton-grid">
      @for (item of items(); track $index) {
        <div class="skeleton-card" aria-hidden="true">
          <div class="skeleton-poster shimmer-anim"></div>
          <div class="skeleton-info">
            <div class="skeleton-title shimmer-anim"></div>
            <div class="skeleton-meta shimmer-anim"></div>
            <div class="skeleton-footer shimmer-anim"></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 24px;
    }

    .skeleton-card {
      border-radius: var(--radius-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .skeleton-poster {
      width: 100%;
      aspect-ratio: 2 / 3;
    }

    .skeleton-info {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .skeleton-title {
      height: 18px;
      border-radius: var(--radius-sm);
      width: 80%;
    }

    .skeleton-meta {
      height: 14px;
      border-radius: var(--radius-sm);
      width: 50%;
    }

    .skeleton-footer {
      height: 14px;
      border-radius: var(--radius-sm);
      width: 65%;
      margin-top: 6px;
    }
  `],
})
export class MovieCardSkeletonComponent {
  readonly count = input<number>(8);

  protected items(): number[] {
    return Array.from({ length: this.count() }, (_, i) => i);
  }
}
