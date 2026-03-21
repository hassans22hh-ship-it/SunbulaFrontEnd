import { UserDto } from '../../../core/auth/auth.service';

export interface RegisterDto {
  email:           string;
  password:        string;
  confirmPassword: string;
  firstName:       string;
  lastName:        string;
  phone?:          string;
}

export interface LoginDto {
  email:    string;
  password: string;
}

export interface AuthResponseDto {
  accessToken:  string;
  refreshToken: string;
  expiresAt:    string;
  user:         UserDto;
}

export interface UpdateProfileDto {
  firstName: string;
  lastName:  string;
  phone?:    string;
}
