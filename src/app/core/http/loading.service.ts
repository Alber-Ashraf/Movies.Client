import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly _activeRequests = signal<number>(0);

  readonly isLoading = computed(() => this._activeRequests() > 0);

  start(): void {
    this._activeRequests.update((c) => c + 1);
  }

  stop(): void {
    this._activeRequests.update((c) => Math.max(0, c - 1));
  }
}
