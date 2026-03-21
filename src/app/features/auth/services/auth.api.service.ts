import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthResponseDto, LoginDto, RegisterDto, UpdateProfileDto } from '../models/auth.models';
import { Observable } from 'rxjs';
import { UserDto } from '../../../core/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/Authentication`;

  register(dto: RegisterDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.base}/register`, dto);
  }

  login(dto: LoginDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.base}/login`, dto);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.base}/logout`, {});
  }

  getProfile(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.base}/profile`);
  }

  updateProfile(dto: UpdateProfileDto): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.base}/profile`, dto);
  }
}
