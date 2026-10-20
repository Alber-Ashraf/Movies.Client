import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-movie-filters',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="filters-bar" aria-label="Catalog Filters">
      <div class="filters-top-row">
        <!-- Search Input -->
        <div class="search-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="search"
            class="search-input"
            placeholder="Search movies by title..."
            [ngModel]="titleSearch()"
            (ngModelChange)="titleChanged.emit($event)"
            aria-label="Search movies by title"
          />
        </div>

        <!-- Year Filter -->
        <div class="control-group">
          <label for="year-input" class="control-label">Release Year</label>
          <input
            id="year-input"
            type="number"
            class="year-input"
            placeholder="All years"
            min="1888"
            max="2035"
            [ngModel]="selectedYear() ?? ''"
            (ngModelChange)="onYearInput($event)"
          />
        </div>

        <!-- Sort Select -->
        <div class="control-group">
          <label for="sort-select" class="control-label">Sort By</label>
          <select
            id="sort-select"
            class="sort-select"
            [ngModel]="sortBy()"
            (ngModelChange)="sortByChanged.emit($event)"
          >
            <option value="">Default Order</option>
            <option value="title">Title (A → Z)</option>
            <option value="-title">Title (Z → A)</option>
            <option value="-yearofrelease">Newest Releases</option>
            <option value="yearofrelease">Classic Releases (Oldest)</option>
          </select>
        </div>

        @if (hasActiveFilters()) {
          <button type="button" class="btn-reset" (click)="resetFilters.emit()">
            Reset Filters
          </button>
        }
      </div>

      <!-- Genre Pills -->
      @if (genres().length > 0) {
        <div class="genre-strip" role="group" aria-label="Filter by genre">
          <button
            type="button"
            class="genre-pill"
            [class.active]="selectedGenre() === ''"
            (click)="genreSelected.emit('')"
          >
            All Genres
          </button>
          @for (genre of genres(); track genre) {
            <button
              type="button"
              class="genre-pill"
              [class.active]="selectedGenre() === genre"
              (click)="genreSelected.emit(genre)"
            >
              {{ genre }}
            </button>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .filters-bar {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 18px 20px;
      margin-bottom: 28px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .filters-top-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 14px;
    }

    .search-box {
      position: relative;
      flex: 1 1 260px;
    }

    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      height: 42px;
      padding: 0 14px 0 42px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      font-size: 0.92rem;
      transition: border-color var(--transition-fast);
    }

    .search-input:focus {
      border-color: var(--accent-gold);
      outline: none;
    }

    .control-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .control-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .year-input,
    .sort-select {
      height: 42px;
      padding: 0 12px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      font-size: 0.88rem;
    }

    .year-input {
      width: 120px;
    }

    .sort-select {
      min-width: 175px;
    }

    .btn-reset {
      height: 42px;
      padding: 0 14px;
      border-radius: var(--radius-md);
      background: var(--color-danger-bg);
      color: var(--color-danger);
      font-size: 0.84rem;
      font-weight: 600;
      transition: all var(--transition-fast);
    }

    .btn-reset:hover {
      opacity: 0.85;
    }

    .genre-strip {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .genre-pill {
      padding: 6px 14px;
      border-radius: var(--radius-full);
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      font-size: 0.82rem;
      font-weight: 500;
      white-space: nowrap;
      transition: all var(--transition-fast);
    }

    .genre-pill:hover {
      color: var(--text-primary);
      background: var(--bg-surface-hover);
    }

    .genre-pill.active {
      background: var(--accent-gold);
      color: var(--text-on-accent);
      border-color: var(--accent-gold);
      font-weight: 600;
    }
  `],
})
export class MovieFiltersComponent {
  readonly titleSearch = input<string>('');
  readonly selectedGenre = input<string>('');
  readonly selectedYear = input<number | undefined>(undefined);
  readonly sortBy = input<string>('');
  readonly genres = input<readonly string[]>([]);
  readonly hasActiveFilters = input<boolean>(false);

  readonly titleChanged = output<string>();
  readonly genreSelected = output<string>();
  readonly yearChanged = output<number | undefined>();
  readonly sortByChanged = output<string>();
  readonly resetFilters = output<void>();

  onYearInput(value: string | number): void {
    const str = String(value).trim();
    if (!str) {
      this.yearChanged.emit(undefined);
      return;
    }
    const parsed = Number(str);
    if (!Number.isNaN(parsed) && parsed >= 1888 && parsed <= 2100) {
      this.yearChanged.emit(parsed);
    }
  }
}
