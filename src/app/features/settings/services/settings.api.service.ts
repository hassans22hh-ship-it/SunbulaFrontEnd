import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface UpdateProfileDto {
  username?: string;
  email?:    string;
  password?: string;
  avatarUrl?: string; // Additional meta if supported
}

@Injectable({ providedIn: 'root' })
export class SettingsApiService {
  private readonly http = inject(HttpClient);
  // Based on contract: PUT /api/Authentication/profile
  private readonly base = `${environment.apiUrl}/api/Authentication/profile`;

  updateProfile(dto: UpdateProfileDto): Observable<any> {
    return this.http.put(this.base, dto);
  }
}
