import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MovieResponse } from '../models/movie.models';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { StarRatingComponent } from '../../../shared/ui/star-rating/star-rating.component';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [RouterLink, BadgeComponent, StarRatingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="movie-card">
      <!-- Dynamic Cinema Poster Artwork -->
      <a [routerLink]="['/movies', movie().slug]" class="poster-frame" [style.background]="posterGradient()">
        <div class="poster-overlay">
          <span class="poster-year">{{ movie().yearOfRelease }}</span>
          <div class="poster-center">
            <span class="poster-monogram">{{ monogram() }}</span>
          </div>
          <div class="poster-rating-pill">
            <span class="star-glyph">★</span>
            <span>{{ formattedAvgRating() }}</span>
          </div>
        </div>
      </a>

      <!-- Card Metadata Body -->
      <div class="card-body">
        <div class="title-row">
          <a [routerLink]="['/movies', movie().slug]" class="movie-title" [title]="movie().title">
            {{ movie().title }}
          </a>
        </div>

        <!-- Genres Row -->
        <div class="genres-row">
          @for (genre of movie().genres.slice(0, 3); track genre) {
            <app-badge variant="genre">{{ genre }}</app-badge>
          }
          @if (movie().genres.length > 3) {
            <app-badge variant="neutral">+{{ movie().genres.length - 3 }}</app-badge>
          }
        </div>

        <!-- Interactive Rating & Admin Actions Footer -->
        <div class="card-footer">
          <div class="user-rating-zone">
            <span class="rating-caption">
              {{ movie().userRating ? 'Your Rating' : 'Rate' }}
            </span>
            <div class="rating-controls">
              <app-star-rating
                [rating]="movie().userRating ?? movie().rating"
                [interactive]="canRate()"
                [showScore]="false"
                (ratingChanged)="rated.emit($event)"
              />
              @if (movie().userRating && canRate()) {
                <button
                  type="button"
                  class="btn-clear-rating"
                  title="Remove your rating"
                  (click)="ratingCleared.emit()"
                >
                  ✕
                </button>
              }
            </div>
          </div>

          @if (isAdmin()) {
            <div class="admin-actions">
              <button
                type="button"
                class="icon-action"
                title="Edit movie"
                (click)="editRequested.emit(movie())"
                aria-label="Edit movie"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </button>
              <button
                type="button"
                class="icon-action danger"
                title="Delete movie"
                (click)="deleteRequested.emit(movie())"
                aria-label="Delete movie"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          }
        </div>
      </div>
    </article>
  `,
  styles: [`
    .movie-card {
      display: flex;
      flex-direction: column;
      border-radius: var(--radius-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      overflow: hidden;
      transition: transform var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal);
      height: 100%;
    }

    .movie-card:hover {
      transform: translateY(-4px);
      border-color: var(--border-focus);
      box-shadow: var(--shadow-poster);
    }

    .poster-frame {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 10;
      display: block;
      overflow: hidden;
    }

    .poster-overlay {
      position: absolute;
      inset: 0;
      padding: 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: linear-gradient(180deg, rgba(11, 13, 19, 0.2) 0%, rgba(11, 13, 19, 0.85) 100%);
    }

    .poster-year {
      align-self: flex-start;
      padding: 3px 9px;
      border-radius: var(--radius-sm);
      background: rgba(11, 13, 19, 0.7);
      backdrop-filter: blur(6px);
      color: #e2e8f0;
      font-size: 0.75rem;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }

    .poster-center {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .poster-monogram {
      font-family: var(--font-display);
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -0.04em;
      color: rgba(255, 255, 255, 0.22);
      user-select: none;
    }

    .poster-rating-pill {
      align-self: flex-end;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      background: rgba(11, 13, 19, 0.82);
      border: 1px solid rgba(245, 166, 35, 0.35);
      color: #f8fafc;
      font-size: 0.8rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    .star-glyph {
      color: var(--accent-gold);
    }

    .card-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 12px;
    }

    .title-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
    }

    .movie-title {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 1.05rem;
      color: var(--text-primary);
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      transition: color var(--transition-fast);
    }

    .movie-title:hover {
      color: var(--accent-gold);
    }

    .genres-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      min-height: 24px;
    }

    .card-footer {
      margin-top: auto;
      padding-top: 12px;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .user-rating-zone {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .rating-caption {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-muted);
      font-weight: 600;
    }

    .rating-controls {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-clear-rating {
      font-size: 0.7rem;
      color: var(--text-muted);
      padding: 2px 5px;
      border-radius: var(--radius-sm);
    }

    .btn-clear-rating:hover {
      color: var(--color-danger);
      background: var(--color-danger-bg);
    }

    .admin-actions {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .icon-action {
      width: 30px;
      height: 30px;
      border-radius: var(--radius-sm);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      transition: all var(--transition-fast);
    }

    .icon-action:hover {
      color: var(--text-primary);
      background: var(--bg-surface-hover);
      border-color: var(--border-medium);
    }

    .icon-action.danger:hover {
      color: var(--color-danger);
      border-color: var(--color-danger);
      background: var(--color-danger-bg);
    }
  `],
})
export class MovieCardComponent {
  readonly movie = input.required<MovieResponse>();
  readonly canRate = input<boolean>(false);
  readonly isAdmin = input<boolean>(false);

  readonly rated = output<number>();
  readonly ratingCleared = output<void>();
  readonly editRequested = output<MovieResponse>();
  readonly deleteRequested = output<MovieResponse>();

  protected readonly formattedAvgRating = computed(() => {
    const r = this.movie().rating;
    return r !== null && r !== undefined ? Number(r).toFixed(1) : 'New';
  });

  protected readonly monogram = computed(() => {
    const words = this.movie()
      .title.trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);
    if (words.length === 0) return 'CM';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  });

  protected readonly posterGradient = computed(() => {
    const title = this.movie().title;
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 48) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 55%, 24%) 0%, hsl(${hue2}, 65%, 14%) 100%)`;
  });
}
