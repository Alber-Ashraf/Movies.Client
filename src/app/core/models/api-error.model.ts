export interface ValidationErrorItem {
  readonly propertyName: string;
  readonly message: string;
}

export interface ValidationFailureResponse {
  readonly errors: readonly ValidationErrorItem[];
}

export interface ProblemDetails {
  readonly type?: string;
  readonly title?: string;
  readonly status?: number;
  readonly detail?: string;
}

export interface ApiError {
  readonly status: number;
  readonly message: string;
  readonly fieldErrors: Readonly<Record<string, string>>;
}
