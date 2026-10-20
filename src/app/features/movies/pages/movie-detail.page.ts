import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/layout/toast.service';
import { ApiError } from '../../../core/models/api-error.model';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ErrorBannerComponent } from '../../../shared/ui/error-banner/error-banner.component';
import { ConfirmDialogComponent } from '../../../shared/ui/modal/confirm-dialog.component';
import { StarRatingComponent } from '../../../shared/ui/star-rating/star-rating.component';
import { MoviesApiService } from '../data-access/movies-api.service';
import { MoviesStore } from '../data-access/movies.store';
import { MovieResponse } from '../models/movie.models';

@Component({
  selector: 'app-movie-detail-page',
  standalone: true,
  imports: [
    RouterLink,
    BadgeComponent,
    StarRatingComponent,
    ErrorBannerComponent,
    ConfirmDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="detail-container">
      <nav class="back-nav">
        <a routerLink="/movies" class="back-link">
          ← Back to Catalog
        </a>
      </nav>

      <!-- 1. Error State -->
      @if (error(); as err) {
        <app-error-banner
          [message]="err.message"
          (retryClicked)="loadMovie()"
        />
      }

      <!-- 2. Loading State -->
      @if (loading()) {
        <div class="detail-skeleton" aria-hidden="true">
          <div class="skeleton-banner shimmer-anim"></div>
          <div class="skeleton-content">
            <div class="skeleton-line shimmer-anim" style="width: 60%; height: 36px;"></div>
            <div class="skeleton-line shimmer-anim" style="width: 30%; height: 20px;"></div>
            <div class="skeleton-line shimmer-anim" style="width: 80%; height: 80px;"></div>
          </div>
        </div>
      }

      <!-- 3. Populated State -->
      @else if (movie(); as m) {
        <article class="movie-presentation">
          <div class="presentation-poster" [style.background]="posterGradient()">
            <div class="poster-badge">{{ m.yearOfRelease }}</div>
            <span class="poster-monogram">{{ monogram() }}</span>
            <div class="poster-slug">{{ m.slug }}</div>
          </div>

          <div class="presentation-body">
            <div class="metadata-strip">
              <span class="release-pill">{{ m.yearOfRelease }}</span>
              <span class="divider-dot">•</span>
              <div class="genres-wrap">
                @for (g of m.genres; track g) {
                  <app-badge variant="genre">{{ g }}</app-badge>
                }
              </div>
            </div>

            <h1 class="movie-title">{{ m.title }}</h1>

            <!-- Ratings Showcase Card -->
            <div class="ratings-card">
              <div class="rating-column">
                <span class="rating-label">Community Rating</span>
                <div class="rating-stat">
                  <span class="star-icon">★</span>
                  <span class="big-score">{{ m.rating ? m.rating.toFixed(1) : 'New' }}</span>
                  @if (m.rating) {
                    <span class="max-score">/ 5.0</span>
                  }
                </div>
              </div>

              <div class="divider-line"></div>

              <div class="rating-column">
                <span class="rating-label">
                  {{ auth.isAuthenticated() ? 'Your Rating' : 'Member Rating' }}
                </span>
                @if (auth.isAuthenticated()) {
                  <div class="interactive-rating-row">
                    <app-star-rating
                      [rating]="m.userRating"
                      [interactive]="true"
                      [showScore]="true"
                      (ratingChanged)="onRateMovie($event)"
                    />
                    @if (m.userRating) {
                      <button
                        type="button"
                        class="btn-remove-rating"
                        (click)="onRemoveRating()"
                      >
                        Remove Rating
                      </button>
                    }
                  </div>
                } @else {
                  <div class="guest-rating-prompt">
                    <span>Switch Identity above to Member or Admin to rate this film.</span>
                  </div>
                }
              </div>
            </div>

            <!-- Technical Identifier Information -->
            <div class="tech-spec-grid">
              <div class="spec-cell">
                <span class="spec-label">Internal GUID</span>
                <code class="spec-val">{{ m.id }}</code>
              </div>
              <div class="spec-cell">
                <span class="spec-label">Canonical Slug</span>
                <code class="spec-val">{{ m.slug }}</code>
              </div>
            </div>

            <!-- Admin Actions Bar -->
            @if (auth.isAdmin()) {
              <div class="admin-toolbar">
                <button
                  type="button"
                  class="btn-admin-edit"
                  (click)="onEditMovie()"
                >
                  Edit Film
                </button>
                <button
                  type="button"
                  class="btn-admin-delete"
                  (click)="isConfirmDeleteOpen.set(true)"
                >
                  Delete Film
                </button>
              </div>
            }
          </div>
        </article>
      }

      <!-- Custom Themed Delete Confirmation Dialog -->
      <app-confirm-dialog
        [isOpen]="isConfirmDeleteOpen()"
        title="Delete Film"
        [message]="'Are you sure you want to delete ' + (movie()?.title ?? '') + '? This action cannot be undone.'"
        confirmLabel="Delete Film"
        (confirmed)="onExecuteDelete()"
        (cancelled)="isConfirmDeleteOpen.set(false)"
      />
    </div>
  `,
  styles: [`
    .detail-container {
      max-width: 1040px;
      margin: 0 auto;
      padding: 32px 24px 80px;
    }

    .back-nav {
      margin-bottom: 24px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-muted);
      transition: color var(--transition-fast);
    }

    .back-link:hover {
      color: var(--accent-gold);
    }

    .detail-skeleton {
      border-radius: var(--radius-lg);
      background: var(--bg-surface);
      overflow: hidden;
      border: 1px solid var(--border-subtle);
    }

    .skeleton-banner {
      width: 100%;
      height: 260px;
    }

    .skeleton-content {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .movie-presentation {
      display: grid;
      grid-template-columns: 340px 1fr;
      gap: 40px;
      border-radius: var(--radius-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      overflow: hidden;
      padding: 36px;
      box-shadow: var(--shadow-lg);
    }

    .presentation-poster {
      position: relative;
      border-radius: var(--radius-md);
      aspect-ratio: 2 / 3;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-poster);
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .poster-badge {
      position: absolute;
      top: 14px;
      left: 14px;
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      background: rgba(11, 13, 19, 0.75);
      backdrop-filter: blur(6px);
      font-size: 0.82rem;
      font-weight: 700;
      color: #fff;
    }

    .poster-monogram {
      font-family: var(--font-display);
      font-size: 4.8rem;
      font-weight: 800;
      color: rgba(255, 255, 255, 0.25);
      user-select: none;
    }

    .poster-slug {
      position: absolute;
      bottom: 12px;
      left: 12px;
      right: 12px;
      text-align: center;
      font-size: 0.76rem;
      font-family: monospace;
      color: rgba(255, 255, 255, 0.55);
      background: rgba(11, 13, 19, 0.6);
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .presentation-body {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .metadata-strip {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .release-pill {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--accent-gold);
    }

    .divider-dot {
      color: var(--text-muted);
    }

    .genres-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .movie-title {
      font-size: clamp(2rem, 3.5vw, 2.75rem);
      font-weight: 800;
      line-height: 1.15;
    }

    .ratings-card {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 28px;
      padding: 20px 24px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      margin: 8px 0;
    }

    .rating-column {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .rating-label {
      font-size: 0.74rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      font-weight: 600;
    }

    .rating-stat {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .star-icon {
      color: var(--accent-gold);
      font-size: 1.3rem;
    }

    .big-score {
      font-size: 1.7rem;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
    }

    .max-score {
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .divider-line {
      width: 1px;
      height: 48px;
      background: var(--border-subtle);
    }

    .interactive-rating-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-remove-rating {
      font-size: 0.78rem;
      color: var(--color-danger);
      font-weight: 600;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
    }

    .btn-remove-rating:hover {
      background: var(--color-danger-bg);
    }

    .guest-rating-prompt {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .tech-spec-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px;
      border-radius: var(--radius-md);
      background: var(--bg-canvas);
      border: 1px solid var(--border-subtle);
    }

    .spec-cell {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-size: 0.82rem;
    }

    .spec-label {
      color: var(--text-muted);
      font-weight: 500;
    }

    .spec-val {
      color: var(--text-secondary);
      font-family: monospace;
      word-break: break-all;
    }

    .admin-toolbar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-top: 12px;
    }

    .btn-admin-edit {
      padding: 9px 18px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-medium);
      color: var(--text-primary);
      font-weight: 600;
      font-size: 0.88rem;
    }

    .btn-admin-edit:hover {
      background: var(--bg-surface-hover);
      border-color: var(--accent-gold);
    }

    .btn-admin-delete {
      padding: 9px 18px;
      border-radius: var(--radius-md);
      background: var(--color-danger-bg);
      border: 1px solid rgba(255, 77, 79, 0.4);
      color: var(--color-danger);
      font-weight: 600;
      font-size: 0.88rem;
    }

    .btn-admin-delete:hover {
      background: var(--color-danger);
      color: #fff;
    }

    @media (max-width: 840px) {
      .movie-presentation {
        grid-template-columns: 1fr;
      }
      .presentation-poster {
        max-width: 280px;
        margin: 0 auto;
      }
      .divider-line {
        display: none;
      }
    }
  `],
})
export class MovieDetailPageComponent implements OnInit {
  readonly idOrSlug = input.required<string>();

  private readonly api = inject(MoviesApiService);
  private readonly store = inject(MoviesStore);
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly movie = signal<MovieResponse | null>(null);
  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<ApiError | null>(null);
  protected readonly isConfirmDeleteOpen = signal<boolean>(false);

  constructor() {
    effect(() => {
      const saved = this.store.lastSavedMovie();
      const current = this.movie();
      if (saved && current && saved.id === current.id) {
        if (saved.slug !== this.idOrSlug()) {
          this.router.navigate(['/movies', saved.slug]);
        } else {
          this.movie.set(saved);
        }
      }
    });
  }

  protected readonly monogram = computed(() => {
    const title = this.movie()?.title ?? '';
    const words = title.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return 'CM';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  });

  protected readonly posterGradient = computed(() => {
    const title = this.movie()?.title ?? '';
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 48) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 55%, 24%) 0%, hsl(${hue2}, 65%, 14%) 100%)`;
  });

  ngOnInit(): void {
    this.loadMovie();
  }

  loadMovie(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.getMovie(this.idOrSlug()).subscribe({
      next: (m) => {
        this.movie.set(m);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.error.set(err);
        this.loading.set(false);
      },
    });
  }

  onRateMovie(rating: number): void {
    const current = this.movie();
    if (!current) return;

    this.api.rateMovie(current.id, rating).subscribe({
      next: () => {
        this.toast.show(`Rated "${current.title}" ${rating}/5 ★`, 'success');
        this.loadMovie();
      },
      error: (err: ApiError) => {
        this.toast.show(err.message, 'error');
      },
    });
  }

  onRemoveRating(): void {
    const current = this.movie();
    if (!current) return;

    this.api.deleteRating(current.id).subscribe({
      next: () => {
        this.toast.show(`Rating removed for "${current.title}".`, 'info');
        this.loadMovie();
      },
      error: (err: ApiError) => {
        this.toast.show(err.message, 'error');
      },
    });
  }

  onEditMovie(): void {
    const current = this.movie();
    if (!current) return;
    this.store.openEditModal(current);
  }

  onExecuteDelete(): void {
    const current = this.movie();
    if (!current) return;

    this.api.deleteMovie(current.id).subscribe({
      next: () => {
        this.isConfirmDeleteOpen.set(false);
        this.toast.show(`"${current.title}" was deleted.`, 'info');
        this.router.navigate(['/movies']);
      },
      error: (err: ApiError) => {
        this.toast.show(err.message, 'error');
      },
    });
  }
}
