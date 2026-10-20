import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastMessage {
  readonly id: number;
  readonly text: string;
  readonly variant: ToastVariant;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private nextId = 1;
  private readonly _toasts = signal<readonly ToastMessage[]>([]);

  readonly toasts = this._toasts.asReadonly();

  show(text: string, variant: ToastVariant = 'info', durationMs = 4000): void {
    const id = this.nextId++;
    this._toasts.update((list) => [...list, { id, text, variant }]);

    if (durationMs > 0) {
      setTimeout(() => this.dismiss(id), durationMs);
    }
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
