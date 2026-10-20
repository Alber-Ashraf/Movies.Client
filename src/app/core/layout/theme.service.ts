import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'dark' | 'light';

const THEME_STORAGE_KEY = 'cinemovies_theme_v1';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly _theme = signal<ThemeMode>(this.getInitialTheme());

  readonly theme = this._theme.asReadonly();

  constructor() {
    this.applyThemeToDocument(this._theme());
  }

  toggleTheme(): void {
    const next: ThemeMode = this._theme() === 'dark' ? 'light' : 'dark';
    this._theme.set(next);
    this.applyThemeToDocument(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Ignore storage errors
    }
  }

  private getInitialTheme(): ThemeMode {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      // Ignore
    }
    return 'dark';
  }

  private applyThemeToDocument(mode: ThemeMode): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', mode);
    }
  }
}
