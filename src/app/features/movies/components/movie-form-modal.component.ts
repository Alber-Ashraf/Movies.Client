import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiError } from '../../../core/models/api-error.model';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { CreateMovieRequest, MovieResponse, UpdateMovieRequest } from '../models/movie.models';

@Component({
  selector: 'app-movie-form-modal',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal
      [isOpen]="isOpen()"
      [title]="editingMovie() ? 'Edit Movie' : 'Add New Movie'"
      (closed)="closed.emit()"
    >
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="movie-form" novalidate>
        @if (apiError()) {
          <div class="api-error-alert" role="alert">
            <strong>{{ apiError()?.status === 409 ? 'Conflict (409):' : 'Error:' }}</strong>
            {{ apiError()?.message }}
          </div>
        }

        <!-- Title Field -->
        <div class="form-field">
          <label for="movie-title" class="field-label">Movie Title *</label>
          <input
            id="movie-title"
            type="text"
            formControlName="title"
            class="field-input"
            placeholder="e.g. Inception"
            [class.invalid]="isFieldInvalid('title')"
          />
          @if (isFieldInvalid('title')) {
            <span class="field-error">A movie title is required.</span>
          }
          @if (apiError()?.fieldErrors?.['title']) {
            <span class="field-error">{{ apiError()?.fieldErrors?.['title'] }}</span>
          }
        </div>

        <!-- Year of Release Field -->
        <div class="form-field">
          <label for="movie-year" class="field-label">Year of Release *</label>
          <input
            id="movie-year"
            type="number"
            formControlName="yearOfRelease"
            class="field-input"
            min="1888"
            [max]="currentYear"
            [class.invalid]="isFieldInvalid('yearOfRelease')"
          />
          @if (isFieldInvalid('yearOfRelease')) {
            <span class="field-error">Enter a valid release year (1900 – {{ currentYear }}).</span>
          }
          @if (apiError()?.fieldErrors?.['yearofrelease']) {
            <span class="field-error">{{ apiError()?.fieldErrors?.['yearofrelease'] }}</span>
          }
        </div>

        <!-- Genres Tag Builder -->
        <div class="form-field">
          <label for="genre-input" class="field-label">Genres *</label>
          <div class="genre-input-row">
            <input
              id="genre-input"
              type="text"
              class="field-input"
              placeholder="Type a genre (e.g. Sci-Fi) and press Enter"
              [value]="genreInputText()"
              (input)="onGenreTextInput($event)"
              (keydown.enter)="addGenreFromInput($event)"
            />
            <button type="button" class="btn-add-tag" (click)="addGenreFromInput()">
              Add
            </button>
          </div>

          <!-- Quick Genre Suggestions -->
          <div class="quick-genres">
            @for (preset of presetGenres; track preset) {
              <button
                type="button"
                class="preset-chip"
                [class.selected]="genresList().includes(preset)"
                (click)="togglePresetGenre(preset)"
              >
                {{ genresList().includes(preset) ? '✓ ' : '+ ' }}{{ preset }}
              </button>
            }
          </div>

          <!-- Active Selected Genres -->
          @if (genresList().length > 0) {
            <div class="selected-genres">
              @for (g of genresList(); track g) {
                <span class="genre-tag">
                  {{ g }}
                  <button
                    type="button"
                    class="remove-tag"
                    (click)="removeGenre(g)"
                    [attr.aria-label]="'Remove ' + g"
                  >
                    ✕
                  </button>
                </span>
              }
            </div>
          } @else if (submittedOnce()) {
            <span class="field-error">Select or add at least one genre.</span>
          }
        </div>

        <footer class="form-actions">
          <button type="button" class="btn-secondary" (click)="closed.emit()">
            Cancel
          </button>
          <button
            type="submit"
            class="btn-primary"
            [disabled]="isSubmitting()"
          >
            {{ isSubmitting() ? 'Saving...' : (editingMovie() ? 'Save Changes' : 'Create Movie') }}
          </button>
        </footer>
      </form>
    </app-modal>
  `,
  styles: [`
    .movie-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .api-error-alert {
      padding: 12px 14px;
      border-radius: var(--radius-md);
      background: var(--color-danger-bg);
      border: 1px solid rgba(255, 77, 79, 0.35);
      color: var(--color-danger);
      font-size: 0.86rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-label {
      font-size: 0.84rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .field-input {
      height: 42px;
      padding: 0 14px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      font-size: 0.92rem;
    }

    .field-input.invalid {
      border-color: var(--color-danger);
    }

    .field-error {
      font-size: 0.78rem;
      color: var(--color-danger);
      font-weight: 500;
    }

    .genre-input-row {
      display: flex;
      gap: 8px;
    }

    .genre-input-row .field-input {
      flex: 1;
    }

    .btn-add-tag {
      padding: 0 16px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-hover);
      border: 1px solid var(--border-medium);
      font-weight: 600;
      font-size: 0.85rem;
    }

    .quick-genres {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 4px;
    }

    .preset-chip {
      padding: 4px 10px;
      border-radius: var(--radius-full);
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      font-size: 0.76rem;
      font-weight: 500;
      transition: all var(--transition-fast);
    }

    .preset-chip.selected {
      background: var(--accent-gold-subtle);
      color: var(--accent-gold);
      border-color: var(--accent-gold);
    }

    .selected-genres {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 6px;
      padding: 10px;
      border-radius: var(--radius-md);
      background: var(--bg-canvas);
      border: 1px solid var(--border-subtle);
    }

    .genre-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      background: var(--bg-surface-elevated);
      color: var(--text-primary);
      font-size: 0.8rem;
      font-weight: 600;
    }

    .remove-tag {
      color: var(--text-muted);
      font-size: 0.72rem;
    }

    .remove-tag:hover {
      color: var(--color-danger);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding-top: 12px;
      border-top: 1px solid var(--border-subtle);
    }

    .btn-secondary {
      padding: 10px 18px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-elevated);
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.88rem;
    }

    .btn-primary {
      padding: 10px 22px;
      border-radius: var(--radius-md);
      background: var(--accent-gold);
      color: var(--text-on-accent);
      font-weight: 700;
      font-size: 0.88rem;
      box-shadow: 0 4px 12px var(--accent-gold-glow);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `],
})
export class MovieFormModalComponent {
  private readonly fb = inject(FormBuilder);

  readonly isOpen = input<boolean>(false);
  readonly editingMovie = input<MovieResponse | null>(null);
  readonly isSubmitting = input<boolean>(false);
  readonly apiError = input<ApiError | null>(null);

  readonly submitted = output<CreateMovieRequest | UpdateMovieRequest>();
  readonly closed = output<void>();

  readonly currentYear = new Date().getUTCFullYear();
  readonly presetGenres: readonly string[] = [
    'Action',
    'Sci-Fi',
    'Drama',
    'Thriller',
    'Crime',
    'Adventure',
    'Comedy',
    'Fantasy',
    'Mystery',
  ];

  protected readonly genresList = signal<readonly string[]>([]);
  protected readonly genreInputText = signal<string>('');
  protected readonly submittedOnce = signal<boolean>(false);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    yearOfRelease: [
      this.currentYear,
      [Validators.required, Validators.min(1900), Validators.max(this.currentYear)],
    ],
  });

  constructor() {
    effect(() => {
      const movie = this.editingMovie();
      const open = this.isOpen();
      if (open) {
        this.submittedOnce.set(false);
        this.genreInputText.set('');
        if (movie) {
          this.form.patchValue({
            title: movie.title,
            yearOfRelease: movie.yearOfRelease,
          });
          this.genresList.set([...movie.genres]);
        } else {
          this.form.reset({
            title: '',
            yearOfRelease: this.currentYear,
          });
          this.genresList.set([]);
        }
      }
    });
  }

  protected isFieldInvalid(field: 'title' | 'yearOfRelease'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.dirty || control.touched || this.submittedOnce());
  }

  protected onGenreTextInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.genreInputText.set(target.value);
  }

  protected addGenreFromInput(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    const raw = this.genreInputText().trim();
    if (!raw) return;

    const current = this.genresList();
    if (!current.some((g) => g.toLowerCase() === raw.toLowerCase())) {
      this.genresList.set([...current, raw]);
    }
    this.genreInputText.set('');
  }

  protected togglePresetGenre(genre: string): void {
    const current = this.genresList();
    if (current.includes(genre)) {
      this.genresList.set(current.filter((g) => g !== genre));
    } else {
      this.genresList.set([...current, genre]);
    }
  }

  protected removeGenre(genre: string): void {
    this.genresList.update((list) => list.filter((g) => g !== genre));
  }

  protected onSubmit(): void {
    this.submittedOnce.set(true);
    if (this.form.invalid || this.genresList().length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, yearOfRelease } = this.form.getRawValue();
    this.submitted.emit({
      title: title.trim(),
      yearOfRelease: Number(yearOfRelease),
      genres: this.genresList(),
    });
  }
}
