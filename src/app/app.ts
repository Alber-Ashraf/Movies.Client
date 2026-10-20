import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeaderComponent } from './core/layout/header.component';
import { ToastContainerComponent } from './core/layout/toast-container.component';
import { MovieFormModalComponent } from './features/movies/components/movie-form-modal.component';
import { MoviesStore } from './features/movies/data-access/movies.store';
import { CreateMovieRequest, UpdateMovieRequest } from './features/movies/models/movie.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    AppHeaderComponent,
    ToastContainerComponent,
    MovieFormModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly store = inject(MoviesStore);

  onSaveMovie(payload: CreateMovieRequest | UpdateMovieRequest): void {
    this.store.saveMovie(payload);
  }
}
