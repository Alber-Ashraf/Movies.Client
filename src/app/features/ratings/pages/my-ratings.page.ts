import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/layout/toast.service';
import { ApiError } from '../../../core/models/api-error.model';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ErrorBannerComponent } from '../../../shared/ui/error-banner/error-banner.component';
import { ConfirmDialogComponent } from '../../../shared/ui/modal/confirm-dialog.component';
import { StarRatingComponent } from '../../../shared/ui/star-rating/star-rating.component';
import { MoviesApiService } from '../../movies/data-access/movies-api.service';
import { MovieRatingResponse } from '../../movies/models/movie.models';

@Component({
  selector: 'app-my-ratings-page',
  standalone: true,
  imports: [
    RouterLink,
    StarRatingComponent,
    EmptyStateComponent,
    ErrorBannerComponent,
    ConfirmDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ratings-page-container">
      <header class="page-header">
        <h1 class="page-title">My Movie Ratings</h1>
        <p class="page-desc">
          Films you've evaluated as {{ auth.session()?.email ?? 'Member' }}
        </p>
      </header>

      @if (error(); as err) {
        <app-error-banner
          [message]="err.message"
          (retryClicked)="loadRatings()"
        />
      }

      @if (loading()) {
        <div class="loading-state shimmer-anim" style="height: 200px; border-radius: var(--radius-lg);"></div>
      } @else if (ratings().length === 0 && !error()) {
        <app-empty-state
          title="No ratings yet"
          description="You haven't rated any movies yet. Explore the cinema catalog and rate your favorite films."
          actionLabel="Browse Cinema Catalog"
          (actionClicked)="router.navigate(['/movies'])"
        />
      } @else {
        <div class="ratings-table-wrap">
          <table class="ratings-table">
            <thead>
              <tr>
                <th>Film Identifier</th>
                <th>Your Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              @for (item of ratings(); track item.movieId) {
                <tr>
                  <td>
                    <a [routerLink]="['/movies', item.slug]" class="movie-link">
                      {{ item.slug }}
                    </a>
                  </td>
                  <td>
                    <app-star-rating
                      [rating]="item.rating"
                      [interactive]="true"
                      [showScore]="true"
                      (ratingChanged)="updateRating(item, $event)"
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      class="btn-delete-rating"
                      (click)="ratingPendingDelete.set(item)"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Custom Themed Confirmation Dialog -->
      <app-confirm-dialog
        [isOpen]="ratingPendingDelete() !== null"
        title="Remove Rating"
        [message]="'Are you sure you want to remove your rating for ' + (ratingPendingDelete()?.slug ?? '') + '?'"
        confirmLabel="Remove Rating"
        (confirmed)="onExecuteDeleteRating()"
        (cancelled)="ratingPendingDelete.set(null)"
      />
    </div>
  `,
  styles: [`
    .ratings-page-container {
      max-width: 960px;
      margin: 0 auto;
      padding: 32px 24px 64px;
    }

    .page-header {
      margin-bottom: 28px;
    }

    .page-title {
      font-size: 2rem;
      margin-bottom: 6px;
    }

    .page-desc {
      color: var(--text-muted);
      font-size: 0.94rem;
    }

    .ratings-table-wrap {
      border-radius: var(--radius-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      overflow: hidden;
    }

    .ratings-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.92rem;
    }

    .ratings-table th {
      padding: 14px 20px;
      font-weight: 600;
      color: var(--text-muted);
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-bottom: 1px solid var(--border-subtle);
      background: var(--bg-surface-elevated);
    }

    .ratings-table td {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .ratings-table tr:last-child td {
      border-bottom: none;
    }

    .movie-link {
      font-weight: 600;
      color: var(--text-primary);
    }

    .movie-link:hover {
      color: var(--accent-gold);
    }

    .btn-delete-rating {
      font-size: 0.8rem;
      color: var(--color-danger);
      font-weight: 600;
      padding: 4px 10px;
      border-radius: var(--radius-sm);
    }

    .btn-delete-rating:hover {
      background: var(--color-danger-bg);
    }
  `],
})
export class MyRatingsPageComponent implements OnInit {
  private readonly api = inject(MoviesApiService);
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  readonly router = inject(Router);

  protected readonly ratings = signal<readonly MovieRatingResponse[]>([]);
  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<ApiError | null>(null);
  protected readonly ratingPendingDelete = signal<MovieRatingResponse | null>(null);

  ngOnInit(): void {
    this.loadRatings();
  }

  loadRatings(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.getMyRatings().subscribe({
      next: (list) => {
        this.ratings.set(list);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.error.set(err);
        this.loading.set(false);
      },
    });
  }

  updateRating(item: MovieRatingResponse, score: number): void {
    this.api.rateMovie(item.movieId, score).subscribe({
      next: () => {
        this.toast.show(`Updated score to ${score}/5 ★`, 'success');
        this.loadRatings();
      },
      error: (err: ApiError) => {
        this.toast.show(err.message, 'error');
      },
    });
  }

  onExecuteDeleteRating(): void {
    const item = this.ratingPendingDelete();
    if (!item) return;

    this.api.deleteRating(item.movieId).subscribe({
      next: () => {
        this.ratingPendingDelete.set(null);
        this.toast.show(`Removed rating for ${item.slug}.`, 'info');
        this.loadRatings();
      },
      error: (err: ApiError) => {
        this.toast.show(err.message, 'error');
      },
    });
  }
}
