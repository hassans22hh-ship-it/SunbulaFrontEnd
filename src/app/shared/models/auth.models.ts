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

export interface AuthResponseDto {
  accessToken:  string;
  refreshToken: string;
  expiresAt:    string;
  user:         UserDto;
}

export interface LoginDto {
  email:    string;
  password: string;
}

export interface RegisterDto {
  email:           string;
  password:        string;
  confirmPassword: string;
  firstName:       string;
  lastName:        string;
  phone?:          string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface LogoutDto {
  refreshToken: string;
}

export interface UpdateProfileDto {
  firstName: string;
  lastName:  string;
  phone?:    string;
}

export interface ChangePasswordDto {
  currentPassword:    string;
  newPassword:        string;
  confirmNewPassword: string;
}

export interface DeleteAccountDto {
  password: string;
}

export interface UserSettingsDto {
  timeZone:             string;
  defaultCurrency:      string;
  coinSystemEnabled:    boolean;
  streakRewardsEnabled: boolean;
}
