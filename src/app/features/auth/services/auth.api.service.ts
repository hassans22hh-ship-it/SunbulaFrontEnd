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
} from '@shared/models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/api/Authentication`;

  register(dto: RegisterDto): Observable<AuthResponseDto>    { return this.http.post<AuthResponseDto>(`${this.BASE}/register`, dto); }
  login(dto: LoginDto): Observable<AuthResponseDto>          { return this.http.post<AuthResponseDto>(`${this.BASE}/login`, dto); }
  getProfile(): Observable<UserDto>                          { return this.http.get<UserDto>(`${this.BASE}/profile`); }
  updateProfile(dto: UpdateProfileDto): Observable<UserDto>  { return this.http.put<UserDto>(`${this.BASE}/profile`, dto); }
}
