import { computed, Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, firstValueFrom, of } from 'rxjs';
import { environment } from '@env/environment';
import { UserDto, AuthResponseDto } from '@shared/models/auth.models';
import { AuthApiService } from '../../features/auth/services/auth.api.service';
import { fetchEventSource } from '@microsoft/fetch-event-source';

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
    this.listenToCoinUpdates();
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

      // Re-establish connection with new token if already active
      if (this.sseAbortController) {
        this.sseAbortController.abort();
        this.sseAbortController = null;
      }
      this.listenToCoinUpdates();
    }
  }

  setUser(user: UserDto): void {
    this._user.set(user);
  }

  updateCoinBalance(newBalance: number): void {
    this._user.update(u => u ? { ...u, coinBalance: newBalance } : null);
  }

  private sseAbortController: AbortController | null = null;

  private listenToCoinUpdates(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.sseAbortController) return;
    
    const url = `${environment.apiUrl}/api/v1/Authentication/coins/listen`;
    const token = this._accessToken();
    if (!token) return;

    this.sseAbortController = new AbortController();

    fetchEventSource(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      signal: this.sseAbortController.signal,
      onmessage: (event) => {
        try {
          const data = JSON.parse(event.data);
          const newBalance = data.newBalance ?? data.coinBalance ?? data.balance ?? data.coins ?? data.totalBalance;
          if (typeof newBalance === 'number') {
            this.updateCoinBalance(newBalance);
          }
        } catch (e) {
          // Heartbeat or malformed data
        }
      },
      onerror: (error) => {
        console.error('SSE Error for Coins:', error);
        // Let fetchEventSource handle transient retries
        // Throw an error or return a specific value if you want to stop retrying.
      },
      onclose: () => {
        this.sseAbortController = null;
      }
    }).catch(err => {
      console.error('SSE Connection failed:', err);
    });
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
    if (this.sseAbortController) {
      this.sseAbortController.abort();
      this.sseAbortController = null;
    }
    this._user.set(null);
    this._accessToken.set(null);
    this._refreshToken.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }
}
