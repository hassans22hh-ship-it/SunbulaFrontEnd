import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { UpdateProfileDto, UserSettingsDto } from '@shared/models/auth.models';

@Injectable({ providedIn: 'root' })
export class SettingsApiService {
  private readonly http = inject(HttpClient);
  // Based on contract: PUT /api/Authentication/profile
  private readonly base = `${environment.apiUrl}/api/v1/Authentication/profile`;

  updateProfile(dto: UpdateProfileDto): Observable<any> {
    return this.http.put(this.base, dto);
  }

  getSettings(): Observable<UserSettingsDto> {
    return this.http.get<UserSettingsDto>(`${environment.apiUrl}/api/v1/Authentication/settings`);
  }

  updateSettings(dto: UserSettingsDto): Observable<UserSettingsDto> {
    return this.http.put<UserSettingsDto>(`${environment.apiUrl}/api/v1/Authentication/settings`, dto);
  }
}
