import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { UpdateProfileDto, UserSettingsDto } from '@shared/models/auth.models';

@Injectable({ providedIn: 'root' })
export class SettingsApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/api/v1/UserSettings`;

  /** Get user settings (theme, notifications, etc) */
  getSettings(): Observable<UserSettingsDto> {
    return this.http.get<UserSettingsDto>(this.BASE);
  }

  /** Update user settings */
  updateSettings(dto: UserSettingsDto): Observable<UserSettingsDto> {
    return this.http.put<UserSettingsDto>(this.BASE, dto);
  }
}
