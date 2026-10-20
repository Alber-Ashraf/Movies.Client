export interface MovieResponse {
  readonly id: string;
  readonly title: string;
  readonly rating: number | null;
  readonly userRating: number | null;
  readonly slug: string;
  readonly yearOfRelease: number;
  readonly genres: readonly string[];
}

export interface MoviesResponse {
  readonly movies: readonly MovieResponse[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly hasNextPage: boolean;
}

export interface CreateMovieRequest {
  readonly title: string;
  readonly yearOfRelease: number;
  readonly genres: readonly string[];
}

export interface UpdateMovieRequest {
  readonly title: string;
  readonly yearOfRelease: number;
  readonly genres: readonly string[];
}

export interface RateMovieRequest {
  readonly rating: number;
}

export interface MovieRatingResponse {
  readonly movieId: string;
  readonly slug: string;
  readonly rating: number;
}

export interface GetAllMoviesParams {
  readonly title?: string;
  readonly year?: number;
  readonly genre?: string;
  readonly sortBy?: string;
  readonly page?: number;
  readonly pageSize?: number;
}
