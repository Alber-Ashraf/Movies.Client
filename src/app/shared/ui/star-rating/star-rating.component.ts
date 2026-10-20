import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="rating-container"
      [class.interactive]="interactive()"
      (mouseleave)="hoverRating.set(null)"
    >
      <div class="stars-row" role="radiogroup" [attr.aria-label]="'Rating: ' + displayScore() + ' out of 5'">
        @for (star of [1, 2, 3, 4, 5]; track star) {
          <button
            type="button"
            class="star-btn"
            [class.filled]="isStarFilled(star)"
            [class.hovered]="hoverRating() !== null && star <= (hoverRating() ?? 0)"
            [disabled]="!interactive()"
            (mouseenter)="onHover(star)"
            (click)="onSelect(star)"
            [attr.aria-label]="star + ' stars'"
          >
            ★
          </button>
        }
      </div>

      @if (showScore()) {
        <span class="score-text">
          {{ displayScore() }}
        </span>
      }
    </div>
  `,
  styles: [`
    .rating-container {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .stars-row {
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }

    .star-btn {
      font-size: 1.15rem;
      line-height: 1;
      color: var(--border-medium);
      transition: color var(--transition-fast), transform var(--transition-fast);
      padding: 0;
    }

    .star-btn.filled {
      color: var(--accent-gold);
    }

    .interactive .star-btn:hover {
      transform: scale(1.18);
      color: var(--accent-gold-hover);
    }

    .star-btn.hovered {
      color: var(--accent-gold);
    }

    .score-text {
      font-size: 0.86rem;
      font-weight: 600;
      color: var(--text-secondary);
      font-variant-numeric: tabular-nums;
    }
  `],
})
export class StarRatingComponent {
  readonly rating = input<number | null>(null);
  readonly interactive = input<boolean>(false);
  readonly showScore = input<boolean>(true);

  readonly ratingChanged = output<number>();

  protected readonly hoverRating = signal<number | null>(null);

  protected readonly displayScore = computed(() => {
    const val = this.hoverRating() ?? this.rating();
    if (val === null || val === undefined) return '—';
    return Number(val).toFixed(1);
  });

  protected isStarFilled(starIndex: number): boolean {
    const current = this.hoverRating() ?? this.rating() ?? 0;
    return starIndex <= Math.round(current);
  }

  protected onHover(star: number): void {
    if (this.interactive()) {
      this.hoverRating.set(star);
    }
  }

  protected onSelect(star: number): void {
    if (this.interactive()) {
      this.ratingChanged.emit(star);
    }
  }
}
