import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError, ProblemDetails, ValidationFailureResponse } from '../models/api-error.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        const fallback: ApiError = {
          status: 0,
          message: 'An unexpected client-side error occurred.',
          fieldErrors: {},
        };
        return throwError(() => fallback);
      }

      let message = 'An unexpected server error occurred.';
      const fieldErrors: Record<string, string> = {};

      if (error.error) {
        // Handle ValidationFailureResponse ({ errors: [{ propertyName, message }] })
        const valResponse = error.error as ValidationFailureResponse;
        if (Array.isArray(valResponse.errors) && valResponse.errors.length > 0) {
          message = valResponse.errors[0].message;
          for (const item of valResponse.errors) {
            if (item.propertyName) {
              const fieldName = item.propertyName.toLowerCase();
              fieldErrors[fieldName] = item.message;
            }
          }
        }
        // Handle RFC 7807/9457 ProblemDetails ({ title, detail, status })
        else if (typeof error.error === 'object') {
          const problem = error.error as ProblemDetails;
          if (problem.title) {
            message = problem.title;
          } else if (problem.detail) {
            message = problem.detail;
          }
        } else if (typeof error.error === 'string') {
          message = error.error;
        }
      }

      if (error.status === 401) {
        message = 'Authentication required. Please select a user role or sign in.';
      } else if (error.status === 403) {
        message = 'Forbidden. This action requires elevated administrator privileges.';
      } else if (error.status === 404) {
        message = message || 'The requested resource was not found.';
      } else if (error.status === 409) {
        message = message || 'A movie with this title and year of release already exists.';
      } else if (error.status === 0) {
        message = 'Unable to connect to the Movies API. Please verify the backend is running.';
      }

      const structuredError: ApiError = {
        status: error.status,
        message,
        fieldErrors,
      };

      return throwError(() => structuredError);
    })
  );
};
