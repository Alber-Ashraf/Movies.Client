import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiError } from '../../../core/models/api-error.model';
import { ToastService } from '../../../core/layout/toast.service';
import {
  CreateMovieRequest,
  GetAllMoviesParams,
  MovieResponse,
  UpdateMovieRequest,
} from '../models/movie.models';
import { MoviesApiService } from './movies-api.service';

@Injectable({
  providedIn: 'root',
})
export class MoviesStore {
  private readonly api = inject(MoviesApiService);
  private readonly toast = inject(ToastService);

  // State signals
  private readonly _movies = signal<readonly MovieResponse[]>([]);
  private readonly _genres = signal<readonly string[]>([]);
  private readonly _totalCount = signal<number>(0);
  private readonly _hasNextPage = signal<boolean>(false);

  // Filter & Pagination signals
  private readonly _titleSearch = signal<string>('');
  private readonly _selectedGenre = signal<string>('');
  private readonly _selectedYear = signal<number | undefined>(undefined);
  private readonly _sortBy = signal<string>('');
  private readonly _page = signal<number>(1);
  private readonly _pageSize = signal<number>(12);

  // Status signals
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<ApiError | null>(null);

  // Modal State for Create / Edit
  private readonly _isEditorOpen = signal<boolean>(false);
  private readonly _editingMovie = signal<MovieResponse | null>(null);
  private readonly _isSubmitting = signal<boolean>(false);
  private readonly _editorError = signal<ApiError | null>(null);
  private readonly _lastSavedMovie = signal<MovieResponse | null>(null);

  // Readonly Public Selectors
  readonly movies = this._movies.asReadonly();
  readonly genres = this._genres.asReadonly();
  readonly totalCount = this._totalCount.asReadonly();
  readonly hasNextPage = this._hasNextPage.asReadonly();

  readonly titleSearch = this._titleSearch.asReadonly();
  readonly selectedGenre = this._selectedGenre.asReadonly();
  readonly selectedYear = this._selectedYear.asReadonly();
  readonly sortBy = this._sortBy.asReadonly();
  readonly page = this._page.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();

  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly isEditorOpen = this._isEditorOpen.asReadonly();
  readonly editingMovie = this._editingMovie.asReadonly();
  readonly isSubmitting = this._isSubmitting.asReadonly();
  readonly editorError = this._editorError.asReadonly();
  readonly lastSavedMovie = this._lastSavedMovie.asReadonly();

  readonly totalPages = computed(() => {
    const total = this._totalCount();
    const size = this._pageSize();
    return Math.max(1, Math.ceil(total / size));
  });

  readonly featuredMovie = computed<MovieResponse | null>(() => {
    const list = this._movies();
    if (list.length === 0) return null;
    return [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0] ?? list[0];
  });

  readonly hasActiveFilters = computed(
    () =>
      this._titleSearch().trim().length > 0 ||
      this._selectedGenre().trim().length > 0 ||
      this._selectedYear() !== undefined ||
      this._sortBy().trim().length > 0
  );

  loadCatalog(): void {
    this._loading.set(true);
    this._error.set(null);

    const params: GetAllMoviesParams = {
      title: this._titleSearch() || undefined,
      genre: this._selectedGenre() || undefined,
      year: this._selectedYear(),
      sortBy: this._sortBy() || undefined,
      page: this._page(),
      pageSize: this._pageSize(),
    };

    this.api.getMovies(params).subscribe({
      next: (res) => {
        this._movies.set(res.movies);
        this._totalCount.set(res.totalCount);
        this._hasNextPage.set(res.hasNextPage);
        this._loading.set(false);
      },
      error: (err: ApiError) => {
        this._error.set(err);
        this._loading.set(false);
      },
    });
  }

  loadGenres(): void {
    this.api.getGenres().subscribe({
      next: (list) => {
        this._genres.set(list);
      },
      error: () => {
        // Non-blocking fallback
      },
    });
  }

  setTitleSearch(title: string): void {
    this._titleSearch.set(title);
    this._page.set(1);
    this.loadCatalog();
  }

  setGenre(genre: string): void {
    const next = this._selectedGenre() === genre ? '' : genre;
    this._selectedGenre.set(next);
    this._page.set(1);
    this.loadCatalog();
  }

  setYear(year: number | undefined): void {
    this._selectedYear.set(year);
    this._page.set(1);
    this.loadCatalog();
  }

  setSortBy(sortBy: string): void {
    this._sortBy.set(sortBy);
    this._page.set(1);
    this.loadCatalog();
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this._page.set(page);
    this.loadCatalog();
  }

  clearFilters(): void {
    this._titleSearch.set('');
    this._selectedGenre.set('');
    this._selectedYear.set(undefined);
    this._sortBy.set('');
    this._page.set(1);
    this.loadCatalog();
  }

  openCreateModal(): void {
    this._editingMovie.set(null);
    this._editorError.set(null);
    this._isEditorOpen.set(true);
  }

  openEditModal(movie: MovieResponse): void {
    this._editingMovie.set(movie);
    this._editorError.set(null);
    this._isEditorOpen.set(true);
  }

  closeEditorModal(): void {
    this._isEditorOpen.set(false);
    this._editingMovie.set(null);
    this._editorError.set(null);
  }

  saveMovie(payload: CreateMovieRequest | UpdateMovieRequest): void {
    const currentEditing = this._editingMovie();
    this._isSubmitting.set(true);
    this._editorError.set(null);

    const req$ = currentEditing
      ? this.api.updateMovie(currentEditing.id, payload)
      : this.api.createMovie(payload);

    req$.subscribe({
      next: (saved) => {
        this._isSubmitting.set(false);
        this._lastSavedMovie.set(saved);
        this.closeEditorModal();
        this.toast.show(
          currentEditing
            ? `"${saved.title}" updated successfully.`
            : `"${saved.title}" added to the catalog.`,
          'success'
        );
        this.loadCatalog();
        this.loadGenres();
      },
      error: (err: ApiError) => {
        this._isSubmitting.set(false);
        this._editorError.set(err);
      },
    });
  }

  deleteMovie(movie: MovieResponse, onSuccess?: () => void): void {
    this.api.deleteMovie(movie.id).subscribe({
      next: () => {
        this.toast.show(`"${movie.title}" removed from the catalog.`, 'info');
        this.loadCatalog();
        this.loadGenres();
        onSuccess?.();
      },
      error: (err: ApiError) => {
        this.toast.show(err.message, 'error');
      },
    });
  }

  rateMovie(movie: MovieResponse, rating: number): void {
    this.api.rateMovie(movie.id, rating).subscribe({
      next: () => {
        this.toast.show(`Rated "${movie.title}" ${rating}/5 ★`, 'success');
        this.loadCatalog();
      },
      error: (err: ApiError) => {
        this.toast.show(err.message, 'error');
      },
    });
  }

  removeRating(movie: MovieResponse): void {
    this.api.deleteRating(movie.id).subscribe({
      next: () => {
        this.toast.show(`Removed your rating for "${movie.title}".`, 'info');
        this.loadCatalog();
      },
      error: (err: ApiError) => {
        this.toast.show(err.message, 'error');
      },
    });
  }

  seedSampleMovies(): void {
    const samples: readonly CreateMovieRequest[] = [
      { title: 'Inception', yearOfRelease: 2010, genres: ['Action', 'Sci-Fi', 'Thriller'] },
      { title: 'Interstellar', yearOfRelease: 2014, genres: ['Adventure', 'Drama', 'Sci-Fi'] },
      { title: 'The Dark Knight', yearOfRelease: 2008, genres: ['Action', 'Crime', 'Drama'] },
      { title: 'Oppenheimer', yearOfRelease: 2023, genres: ['Biography', 'Drama', 'History'] },
      { title: 'The Matrix', yearOfRelease: 1999, genres: ['Action', 'Sci-Fi'] },
      { title: 'Pulp Fiction', yearOfRelease: 1994, genres: ['Crime', 'Drama'] },
    ];

    let created = 0;
    this._loading.set(true);

    samples.forEach((sample, idx) => {
      this.api.createMovie(sample).subscribe({
        next: () => {
          created++;
          if (idx === samples.length - 1) {
            this.toast.show(`Seeded ${created} iconic movies into the catalog.`, 'success');
            this.loadCatalog();
            this.loadGenres();
          }
        },
        error: () => {
          if (idx === samples.length - 1) {
            this.loadCatalog();
            this.loadGenres();
          }
        },
      });
    });
  }
}
