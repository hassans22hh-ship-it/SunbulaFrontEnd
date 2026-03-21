import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface UserDto {
  userId:                string;
  email:                 string;
  firstName:             string;
  lastName:              string;
  fullName:              string;
  phone:                 string | null;
  isActive:              boolean;
  isEmailConfirmed:      boolean;
  coinBalance:           number;
  consecutiveStreakDays:  number;
  createdAt:             string;
  lastLoginAt:           string;
}

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

    // Check if token is still valid
    if (expires && new Date(expires) > new Date()) {
      this._accessToken.set(access);
      this._refreshToken.set(refresh);
      try {
        await this.loadProfile();
      } catch {
        this.clearTokens();
      }
    } else if (refresh) {
      // Try refresh
      try {
        await this.performRefresh(refresh);
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

  async performRefresh(refreshToken?: string): Promise<string> {
    const token = refreshToken ?? this._refreshToken();
    if (!token) throw new Error('No refresh token');

    const response = await firstValueFrom(
      this.http.post<{ accessToken: string; refreshToken: string; expiresAt: string }>(
        `${environment.apiUrl}/api/Authentication/refresh`,
        { refreshToken: token },
      ),
    );

    this.setTokens(response.accessToken, response.refreshToken, response.expiresAt);
    return response.accessToken;
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/api/Authentication/logout`, {}),
      );
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
