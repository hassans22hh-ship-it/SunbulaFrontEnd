import { computed, Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, firstValueFrom, of } from 'rxjs';
import { environment } from '@env/environment';
import { UserDto, AuthResponseDto, RefreshTokenDto, LogoutDto } from '@shared/models/auth.models';

const STORAGE_KEYS = {
  access:  'sb_access',
  refresh: 'sb_refresh',
  expires: 'sb_expires',
} as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _user         = signal<UserDto | null>(null);
  private readonly _accessToken  = signal<string | null>(null);
  private readonly _refreshToken = signal<string | null>(null);

  readonly user            = this._user.asReadonly();
  readonly accessToken     = this._accessToken.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly coinBalance     = computed(() => this._user()?.coinBalance ?? 0);
  readonly streakDays      = computed(() => this._user()?.consecutiveStreakDays ?? 0);

  /** Load tokens from sessionStorage and restore user session */
  async initialize(): Promise<void> {
    const access  = sessionStorage.getItem(STORAGE_KEYS.access);
    const refresh = sessionStorage.getItem(STORAGE_KEYS.refresh);
    const expires = sessionStorage.getItem(STORAGE_KEYS.expires);

    if (!access) return;

    if (expires && new Date(expires) > new Date()) {
      this._accessToken.set(access);
      this._refreshToken.set(refresh);
      try {
        await this.loadProfile();
      } catch {
        this.clearTokens();
      }
    } else if (refresh) {
      try {
        await firstValueFrom(this.refreshTokens());
        await this.loadProfile();
      } catch {
        this.clearTokens();
      }
    }
  }

  async loadProfile(): Promise<void> {
    const user = await firstValueFrom(
      this.http.get<UserDto>(`${environment.apiUrl}/api/Authentication/profile`),
    );
    this._user.set(user);
  }

  /** Refresh user profile from server — call after timer stops to get updated coinBalance */
  async refreshUserProfile(): Promise<void> {
    try {
      await this.loadProfile();
    } catch {
      // Silently fail — profile will be stale but not broken
    }
  }

  setTokens(accessToken: string, refreshToken: string, expiresAt: string): void {
    this._accessToken.set(accessToken);
    this._refreshToken.set(refreshToken);
    sessionStorage.setItem(STORAGE_KEYS.access,  accessToken);
    sessionStorage.setItem(STORAGE_KEYS.refresh, refreshToken);
    sessionStorage.setItem(STORAGE_KEYS.expires, expiresAt);
  }

  setUser(user: UserDto): void {
    this._user.set(user);
  }

  updateCoinBalance(newBalance: number): void {
    this._user.update(u => u ? { ...u, coinBalance: newBalance } : null);
  }

  refreshTokens(): Observable<AuthResponseDto> {
    const token = this._refreshToken();
    if (!token) return of(null as unknown as AuthResponseDto);

    return new Observable<AuthResponseDto>(observer => {
      this.http.post<AuthResponseDto>(
        `${environment.apiUrl}/api/Authentication/refresh`,
        { refreshToken: token } as RefreshTokenDto,
      ).subscribe({
        next: response => {
          this.setTokens(response.accessToken, response.refreshToken, response.expiresAt);
          observer.next(response);
          observer.complete();
        },
        error: err => {
          this.clearTokens();
          observer.error(err);
        }
      });
    });
  }

  async logout(): Promise<void> {
    const refreshToken = this._refreshToken();
    try {
      if (refreshToken) {
        await firstValueFrom(
          this.http.post(`${environment.apiUrl}/api/Authentication/logout`, { refreshToken } as LogoutDto),
        );
      }
    } catch {
      // Ignore errors — always clear local state
    } finally {
      this.clearTokens();
      this.router.navigate(['/auth/login']);
    }
  }

  private clearTokens(): void {
    this._user.set(null);
    this._accessToken.set(null);
    this._refreshToken.set(null);
    sessionStorage.removeItem(STORAGE_KEYS.access);
    sessionStorage.removeItem(STORAGE_KEYS.refresh);
    sessionStorage.removeItem(STORAGE_KEYS.expires);
  }
}
