import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  AuthResponseDto,
  LoginDto,
  RegisterDto,
  UserDto,
  UpdateProfileDto,
  ChangePasswordDto,
  DeleteAccountDto,
} from '@shared/models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/api/v1/Authentication`;

  register(dto: RegisterDto): Observable<AuthResponseDto> { return this.http.post<AuthResponseDto>(`${this.BASE}/register`, dto); }
  login(dto: LoginDto): Observable<AuthResponseDto> { return this.http.post<AuthResponseDto>(`${this.BASE}/login`, dto); }
  refreshToken(refreshToken: string): Observable<AuthResponseDto> { 
    return this.http.post<AuthResponseDto>(`${this.BASE}/refresh`, { refreshToken }); 
  }
  logout(refreshToken: string): Observable<void> { 
    return this.http.post<void>(`${this.BASE}/logout`, { refreshToken }); 
  }
  getProfile(): Observable<UserDto> { return this.http.get<UserDto>(`${this.BASE}/profile`); }
  updateProfile(dto: UpdateProfileDto): Observable<UserDto> { return this.http.put<UserDto>(`${this.BASE}/profile`, dto); }
  resendConfirmationEmail(): Observable<void> { return this.http.post<void>(`${this.BASE}/resend-confirmation`, {}); }
  changePassword(dto: ChangePasswordDto): Observable<void> { return this.http.post<void>(`${this.BASE}/change-password`, dto); }
  deleteAccount(password: string): Observable<void> { return this.http.delete<void>(`${this.BASE}/account`, { body: { password } }); }
  resetCoins(): Observable<void> { return this.http.post<void>(`${this.BASE}/reset-coins`, {}); }
}
