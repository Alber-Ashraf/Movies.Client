import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ErrorBannerComponent } from '../../../shared/ui/error-banner/error-banner.component';
import { ConfirmDialogComponent } from '../../../shared/ui/modal/confirm-dialog.component';
import { MovieCardSkeletonComponent } from '../../../shared/ui/skeleton/movie-card-skeleton.component';
import { StarRatingComponent } from '../../../shared/ui/star-rating/star-rating.component';
import { MovieCardComponent } from '../components/movie-card.component';
import { MovieFiltersComponent } from '../components/movie-filters.component';
import { TrailerModalComponent } from '../components/trailer-modal.component';
import { MoviesStore } from '../data-access/movies.store';
import { MovieResponse } from '../models/movie.models';

@Component({
  selector: 'app-movie-list-page',
  standalone: true,
  imports: [
    RouterLink,
    BadgeComponent,
    StarRatingComponent,
    MovieCardComponent,
    MovieFiltersComponent,
    MovieCardSkeletonComponent,
    EmptyStateComponent,
    ErrorBannerComponent,
    ConfirmDialogComponent,
    TrailerModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="catalog-page">
      <!-- Featured Cinema Spotlight Hero -->
      @if (store.featuredMovie(); as featured) {
        @if (!store.hasActiveFilters() && store.page() === 1) {
          <section class="hero-spotlight">
            <div class="hero-backdrop-glow"></div>
            <div class="hero-content">
              <div class="hero-eyebrow">
                <app-badge variant="gold">★ FEATURED SCREENING</app-badge>
                <span class="hero-year">{{ featured.yearOfRelease }}</span>
              </div>

              <h1 class="hero-title">{{ featured.title }}</h1>

              <div class="hero-genres">
                @for (g of featured.genres; track g) {
                  <app-badge variant="genre">{{ g }}</app-badge>
                }
              </div>

              @if (featured.description) {
                <p class="hero-description">{{ featured.description }}</p>
              }

              <div class="hero-metrics">
                <div class="metric-block">
                  <span class="metric-label">Community Rating</span>
                  <div class="metric-val">
                    <span class="gold-star">★</span>
                    <strong>{{ featured.rating ? featured.rating.toFixed(1) : 'Unrated' }}</strong>
                    @if (featured.rating) {
                      <span class="out-of">/ 5.0</span>
                    }
                  </div>
                </div>

                @if (auth.isAuthenticated()) {
                  <div class="metric-block">
                    <span class="metric-label">Your Rating</span>
                    <app-star-rating
                      [rating]="featured.userRating"
                      [interactive]="true"
                      [showScore]="true"
                      (ratingChanged)="store.rateMovie(featured, $event)"
                    />
                  </div>
                }
              </div>

              <div class="hero-cta-row">
                <a [routerLink]="['/movies', featured.slug]" class="btn-spotlight-primary">
                  Explore Details
                </a>
                @if (featured.trailerUrl) {
                  <button
                    type="button"
                    class="btn-spotlight-trailer"
                    (click)="isFeaturedTrailerOpen.set(true)"
                  >
                    ▶ Watch Trailer
                  </button>
                }
                @if (auth.canManageMovies()) {
                  <button
                    type="button"
                    class="btn-spotlight-ghost"
                    (click)="store.openEditModal(featured)"
                  >
                    Edit Featured
                  </button>
                }
              </div>
            </div>
          </section>

          <app-trailer-modal
            [isOpen]="isFeaturedTrailerOpen()"
            [movieTitle]="featured.title"
            [trailerUrl]="featured.trailerUrl"
            (closed)="isFeaturedTrailerOpen.set(false)"
          />
        }
      }

      <!-- Catalog Header & Count -->
      <div class="section-header">
        <div>
          <h2 class="section-title">Cinema Archive</h2>
          <p class="section-subtitle">
            Showing {{ store.movies().length }} of {{ store.totalCount() }} indexed films
          </p>
        </div>

        @if (!auth.isAuthenticated()) {
          <div class="auth-hint-pill">
            <span>Sign in as a <strong>Member</strong>, <strong>Critic</strong>, or <strong>Admin</strong> to rate films and contribute to the archive.</span>
          </div>
        }
      </div>

      <!-- Search, Genre Chips, Year & Sort Filters -->
      <app-movie-filters
        [titleSearch]="store.titleSearch()"
        [selectedGenre]="store.selectedGenre()"
        [selectedYear]="store.selectedYear()"
        [sortBy]="store.sortBy()"
        [genres]="store.genres()"
        [hasActiveFilters]="store.hasActiveFilters()"
        (titleChanged)="onSearchTextChanged($event)"
        (genreSelected)="store.setGenre($event)"
        (yearChanged)="store.setYear($event)"
        (sortByChanged)="store.setSortBy($event)"
        (resetFilters)="store.clearFilters()"
      />

      <!-- 4 Mandatory UX States -->
      <!-- 1. Error State -->
      @if (store.error(); as err) {
        <app-error-banner
          [message]="err.message"
          hint="Ensure the ASP.NET Core Movies.Api backend is reachable and CORS is configured."
          (retryClicked)="store.loadCatalog()"
        />
      }

      <!-- 2. Loading Skeleton State -->
      @if (store.loading()) {
        <app-movie-card-skeleton [count]="8" />
      }
      <!-- 3. Empty State -->
      @else if (store.movies().length === 0 && !store.error()) {
        <div class="empty-state-container">
          <app-empty-state
            [title]="store.hasActiveFilters() ? 'No matching films found' : 'The cinema catalog is empty'"
            [description]="
              store.hasActiveFilters()
                ? 'No movies matched your active search or filter criteria. Try resetting the filters.'
                : 'Get started by adding your first movie or seeding iconic sample classics.'
            "
            [actionLabel]="
              store.hasActiveFilters()
                ? 'Clear All Filters'
                : auth.isAdmin()
                  ? '+ Add First Movie'
                  : null
            "
            (actionClicked)="onEmptyStateAction()"
          />

          @if (!store.hasActiveFilters() && auth.isAdmin()) {
            <div class="seed-action-row">
              <button
                type="button"
                class="btn-seed"
                (click)="store.seedSampleMovies()"
              >
                Seed 15 Iconic Films via Backend DataSeeder
              </button>
            </div>
          }
        </div>
      }
      <!-- 4. Populated State -->
      @else if (store.movies().length > 0) {
        <div class="movies-grid">
          @for (movie of store.movies(); track movie.id) {
            <app-movie-card
              [movie]="movie"
              [canRate]="auth.isAuthenticated()"
              [canEdit]="auth.canManageMovies()"
              [canDelete]="auth.isAdmin()"
              (rated)="store.rateMovie(movie, $event)"
              (ratingCleared)="store.removeRating(movie)"
              (editRequested)="store.openEditModal($event)"
              (deleteRequested)="onOpenDeleteConfirm($event)"
            />
          }
        </div>

        <!-- Pagination Bar -->
        @if (store.totalCount() > store.pageSize()) {
          <nav class="pagination-bar" aria-label="Catalog Pagination">
            <button
              type="button"
              class="page-btn"
              [disabled]="store.page() <= 1"
              (click)="store.setPage(store.page() - 1)"
            >
              ← Previous
            </button>

            <span class="page-indicator">
              Page <strong>{{ store.page() }}</strong> of <strong>{{ store.totalPages() }}</strong>
            </span>

            <button
              type="button"
              class="page-btn"
              [disabled]="!store.hasNextPage()"
              (click)="store.setPage(store.page() + 1)"
            >
              Next →
            </button>
          </nav>
        }
      }

      <!-- Custom Themed Delete Confirmation Dialog -->
      <app-confirm-dialog
        [isOpen]="moviePendingDelete() !== null"
        title="Delete Movie"
        [message]="'Are you sure you want to delete ' + (moviePendingDelete()?.title ?? '') + ' (' + (moviePendingDelete()?.yearOfRelease ?? '') + ') from the archive? This action cannot be undone.'"
        confirmLabel="Delete Movie"
        (confirmed)="onExecuteDelete()"
        (cancelled)="moviePendingDelete.set(null)"
      />
    </div>
  `,
  styles: [`
    .catalog-page {
      max-width: 1360px;
      margin: 0 auto;
      padding: 28px 24px 64px;
    }

    .hero-spotlight {
      position: relative;
      border-radius: var(--radius-lg);
      background: linear-gradient(135deg, var(--bg-surface-elevated) 0%, var(--bg-surface) 100%);
      border: 1px solid var(--border-medium);
      padding: 40px 44px;
      margin-bottom: 36px;
      overflow: hidden;
      box-shadow: var(--shadow-lg);
    }

    .hero-backdrop-glow {
      position: absolute;
      top: -40%;
      right: -10%;
      width: 480px;
      height: 480px;
      background: radial-gradient(circle, var(--accent-gold-glow) 0%, transparent 70%);
      pointer-events: none;
    }

    .hero-content {
      position: relative;
      z-index: 1;
      max-width: 720px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .hero-eyebrow {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .hero-year {
      font-size: 0.86rem;
      font-weight: 600;
      color: var(--text-muted);
      font-variant-numeric: tabular-nums;
    }

    .hero-title {
      font-size: clamp(1.85rem, 3.5vw, 2.75rem);
      font-weight: 800;
      letter-spacing: -0.03em;
    }

    .hero-genres {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .hero-description {
      font-size: 0.96rem;
      line-height: 1.55;
      color: var(--text-secondary);
      max-width: 640px;
      margin: 2px 0 0;
    }

    .hero-metrics {
      display: flex;
      flex-wrap: wrap;
      gap: 28px;
      padding: 14px 0;
    }

    .metric-block {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .metric-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      font-weight: 600;
    }

    .metric-val {
      display: flex;
      align-items: baseline;
      gap: 6px;
      font-size: 1.2rem;
    }

    .gold-star {
      color: var(--accent-gold);
    }

    .out-of {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .hero-cta-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 4px;
    }

    .btn-spotlight-primary {
      padding: 10px 22px;
      border-radius: var(--radius-md);
      background: var(--accent-gold);
      color: var(--text-on-accent);
      font-weight: 700;
      font-size: 0.9rem;
      transition: all var(--transition-fast);
      box-shadow: 0 4px 14px var(--accent-gold-glow);
    }

    .btn-spotlight-primary:hover {
      background: var(--accent-gold-hover);
      transform: translateY(-1px);
    }

    .btn-spotlight-ghost {
      padding: 10px 18px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-hover);
      border: 1px solid var(--border-medium);
      color: var(--text-primary);
      font-weight: 600;
      font-size: 0.9rem;
    }

    .btn-spotlight-trailer {
      padding: 10px 20px;
      border-radius: var(--radius-md);
      background: rgba(229, 9, 20, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
      font-weight: 700;
      font-size: 0.9rem;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all var(--transition-fast);
    }

    .btn-spotlight-trailer:hover {
      background: #e50914;
      transform: translateY(-1px);
    }

    .section-header {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 18px;
    }

    .section-title {
      font-size: 1.5rem;
    }

    .section-subtitle {
      font-size: 0.88rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .auth-hint-pill {
      padding: 8px 14px;
      border-radius: var(--radius-md);
      background: var(--accent-gold-subtle);
      border: 1px solid var(--accent-gold-glow);
      color: var(--text-secondary);
      font-size: 0.82rem;
    }

    .empty-state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .seed-action-row {
      margin-top: -8px;
      margin-bottom: 24px;
    }

    .btn-seed {
      padding: 10px 20px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-elevated);
      border: 1px dashed var(--accent-gold);
      color: var(--accent-gold);
      font-weight: 600;
      font-size: 0.88rem;
      transition: all var(--transition-fast);
    }

    .btn-seed:hover {
      background: var(--accent-gold-subtle);
      transform: translateY(-1px);
    }

    .movies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 24px;
    }

    .pagination-bar {
      margin-top: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
    }

    .page-btn {
      padding: 9px 18px;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      font-weight: 600;
      font-size: 0.88rem;
      transition: all var(--transition-fast);
    }

    .page-btn:hover:not(:disabled) {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }

    .page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .page-indicator {
      font-size: 0.9rem;
      color: var(--text-secondary);
      font-variant-numeric: tabular-nums;
    }

    @media (max-width: 640px) {
      .hero-spotlight {
        padding: 24px 20px;
      }
      .catalog-page {
        padding: 20px 16px 48px;
      }
    }
  `],
})
export class MovieListPageComponent implements OnInit {
  readonly store = inject(MoviesStore);
  readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly searchSubject = new Subject<string>();
  protected readonly moviePendingDelete = signal<MovieResponse | null>(null);
  protected readonly isFeaturedTrailerOpen = signal<boolean>(false);

  ngOnInit(): void {
    this.store.loadCatalog();
    this.store.loadGenres();

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((term) => {
        this.store.setTitleSearch(term);
      });
  }

  onSearchTextChanged(term: string): void {
    this.searchSubject.next(term);
  }

  onEmptyStateAction(): void {
    if (this.store.hasActiveFilters()) {
      this.store.clearFilters();
    } else if (this.auth.isAdmin()) {
      this.store.openCreateModal();
    }
  }

  onOpenDeleteConfirm(movie: MovieResponse): void {
    this.moviePendingDelete.set(movie);
  }

  onExecuteDelete(): void {
    const movie = this.moviePendingDelete();
    if (movie) {
      this.store.deleteMovie(movie, () => {
        this.moviePendingDelete.set(null);
      });
    }
  }
}
