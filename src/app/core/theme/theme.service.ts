import { computed, Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly _theme = signal<'light' | 'dark'>('light');
  readonly theme  = this._theme.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');

  init(): void {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('sb_theme') as 'light' | 'dark' | null;
      const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      this.apply(saved ?? preferred);
    } else {
      this.apply('light');
    }
  }

  toggle(): void {
    this.apply(this._theme() === 'light' ? 'dark' : 'light');
  }

  apply(theme: 'light' | 'dark'): void {
    this._theme.set(theme);
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('sb_theme', theme);
    }
  }
}
