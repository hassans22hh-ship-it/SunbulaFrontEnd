import { computed, Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, firstValueFrom, of } from 'rxjs';
import { environment } from '@env/environment';
import { UserDto, AuthResponseDto } from '@shared/models/auth.models';
import { AuthApiService } from '../../features/auth/services/auth.api.service';

const REFRESH_TOKEN_KEY = 'sunbula_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApi = inject(AuthApiService);
  private readonly router  = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _user         = signal<UserDto | null>(null);
  private readonly _accessToken  = signal<string | null>(null);
  private readonly _refreshToken = signal<string | null>(null);

  readonly user            = this._user.asReadonly();
  readonly accessToken     = this._accessToken.asReadonly();
  readonly isAuthenticated  = computed(() => this._user() !== null);
  readonly isEmailConfirmed = computed(() => this._user()?.isEmailConfirmed ?? false);
  readonly coinBalance      = computed(() => this._user()?.coinBalance ?? 0);
  readonly streakDays       = computed(() => {
    const val: any = this._user()?.consecutiveStreakDays ?? 0;
    return typeof val === 'number' ? val : (val?.streak ?? 0);
  });

  /** Load tokens from localStorage and restore user session */
  async initialize(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    // Clear legacy sessionStorage tokens if present
    sessionStorage.removeItem('sb_access');
    sessionStorage.removeItem('sb_refresh');
    sessionStorage.removeItem('sb_expires');

    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refresh) {
      this._refreshToken.set(refresh);
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
      this.authApi.getProfile() as Observable<UserDto>
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
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
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
      this.authApi.refreshToken(token).subscribe({
        next: (response: any) => {
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
        await firstValueFrom(this.authApi.logout(refreshToken));
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
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }
}
