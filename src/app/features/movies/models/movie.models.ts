export interface MovieResponse {
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly trailerUrl?: string | null;
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
  readonly description?: string | null;
  readonly trailerUrl?: string | null;
  readonly yearOfRelease: number;
  readonly genres: readonly string[];
}

export interface UpdateMovieRequest {
  readonly title: string;
  readonly description?: string | null;
  readonly trailerUrl?: string | null;
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

export function extractYouTubeVideoId(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export function getYouTubeThumbnailUrl(url?: string | null): string | null {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
}
