import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../../core/config/app.config.token';
import {
  CreateMovieRequest,
  GetAllMoviesParams,
  MovieRatingResponse,
  MovieResponse,
  MoviesResponse,
  RateMovieRequest,
  UpdateMovieRequest,
} from '../models/movie.models';

@Injectable({
  providedIn: 'root',
})
export class MoviesApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  getMovies(params: GetAllMoviesParams): Observable<MoviesResponse> {
    let httpParams = new HttpParams();

    if (params.title && params.title.trim().length > 0) {
      httpParams = httpParams.set('title', params.title.trim());
    }
    if (params.year !== undefined && params.year !== null) {
      httpParams = httpParams.set('year', params.year.toString());
    }
    if (params.genre && params.genre.trim().length > 0) {
      httpParams = httpParams.set('genre', params.genre.trim());
    }
    if (params.sortBy && params.sortBy.trim().length > 0) {
      httpParams = httpParams.set('sortBy', params.sortBy.trim());
    }
    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.pageSize !== undefined) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }

    return this.http.get<MoviesResponse>(`${this.config.apiBaseUrl}/movies`, {
      params: httpParams,
    });
  }

  getMovie(idOrSlug: string): Observable<MovieResponse> {
    return this.http.get<MovieResponse>(
      `${this.config.apiBaseUrl}/movies/${encodeURIComponent(idOrSlug)}`
    );
  }

  createMovie(request: CreateMovieRequest): Observable<MovieResponse> {
    return this.http.post<MovieResponse>(`${this.config.apiBaseUrl}/movies`, request);
  }

  updateMovie(id: string, request: UpdateMovieRequest): Observable<MovieResponse> {
    return this.http.put<MovieResponse>(
      `${this.config.apiBaseUrl}/movies/${encodeURIComponent(id)}`,
      request
    );
  }

  deleteMovie(id: string): Observable<void> {
    return this.http.delete<void>(`${this.config.apiBaseUrl}/movies/${encodeURIComponent(id)}`);
  }

  rateMovie(id: string, rating: number): Observable<void> {
    const payload: RateMovieRequest = { rating };
    return this.http.put<void>(
      `${this.config.apiBaseUrl}/movies/${encodeURIComponent(id)}/ratings`,
      payload
    );
  }

  deleteRating(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.apiBaseUrl}/movies/${encodeURIComponent(id)}/ratings`
    );
  }

  getMyRatings(): Observable<readonly MovieRatingResponse[]> {
    return this.http.get<readonly MovieRatingResponse[]>(`${this.config.apiBaseUrl}/ratings/me`);
  }

  getGenres(): Observable<readonly string[]> {
    return this.http.get<readonly string[]>(`${this.config.apiBaseUrl}/genres`);
  }
}
