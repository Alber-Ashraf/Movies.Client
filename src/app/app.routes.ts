import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guards';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'movies',
  },
  {
    path: 'movies',
    loadComponent: () =>
      import('./features/movies/pages/movie-list.page').then((m) => m.MovieListPageComponent),
  },
  {
    path: 'movies/:idOrSlug',
    loadComponent: () =>
      import('./features/movies/pages/movie-detail.page').then((m) => m.MovieDetailPageComponent),
  },
  {
    path: 'ratings/me',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/ratings/pages/my-ratings.page').then((m) => m.MyRatingsPageComponent),
  },
  {
    path: '**',
    redirectTo: 'movies',
  },
];
