import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../services/auth.api.service';
import { AuthService } from '@core/auth/auth.service';
import { GsapService } from '@core/animation/gsap.service';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { ToastService } from '@shared/ui/toast/toast.service';

@Component({
  selector: 'sb-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SbButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-page" sbPage>
      <div class="auth-card animate-scale-in">
        <!-- Header -->
        <div class="auth-header">
          <div class="auth-logo">🌻</div>
          <h1 class="auth-title">Welcome Back</h1>
          <p class="auth-subtitle">Sign in to your Sunbula account</p>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <!-- Email -->
          <div class="form-group">
            <label class="label-text">Email</label>
            <input
              class="input-field"
              type="email"
              formControlName="email"
              placeholder="you@example.com"
              autocomplete="email"
            >
            @if (form.get('email')?.touched && form.get('email')?.hasError('required')) {
              <span class="error-text">Email is required</span>
            } @else if (form.get('email')?.touched && form.get('email')?.hasError('email')) {
              <span class="error-text">Enter a valid email address</span>
            }
          </div>

          <!-- Password -->
          <div class="form-group">
            <label class="label-text">Password</label>
            <div class="input-wrapper">
              <input
                class="input-field"
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                placeholder="••••••••"
                autocomplete="current-password"
              >
              <button type="button" class="pwd-toggle" (click)="showPassword.set(!showPassword())">
                {{ showPassword() ? '🙈' : '👁️' }}
              </button>
            </div>
            @if (form.get('password')?.touched && form.get('password')?.hasError('required')) {
              <span class="error-text">Password is required</span>
            }
          </div>

          <!-- Forgot password link -->
          <div style="text-align: right; margin-bottom: 1.25rem;">
            <a routerLink="/auth/forgot-password" class="link-text">Forgot password?</a>
          </div>

          <!-- Submit -->
          <sb-button type="submit" [loading]="loading()" [disabled]="form.invalid" [fullWidth]="true">
            Sign In
          </sb-button>

          <!-- Error -->
          @if (errorMsg()) {
            <p class="error-banner">{{ errorMsg() }}</p>
          }
        </form>

        <div class="auth-footer">
          <span>Don't have an account?</span>
          <a routerLink="/auth/register" class="link-text">Sign up</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-bg);
      padding: 1.5rem;
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      card: ;
      padding: 2.5rem;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
    }
    .auth-header { text-align: center; margin-bottom: 2rem; }
    .auth-logo { font-size: 3rem; margin-bottom: 0.75rem; }
    .auth-title {
      font-family: var(--font-display);
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--color-text);
      margin: 0 0 0.375rem;
    }
    .auth-subtitle { color: var(--color-text-muted); font-size: 0.9375rem; margin: 0; }
    .form-group { margin-bottom: 1.125rem; }
    .input-wrapper { position: relative; }
    .input-wrapper .input-field { padding-right: 2.75rem; }
    .pwd-toggle {
      position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; font-size: 1rem; padding: 0.25rem;
    }
    .error-text { color: var(--color-danger); font-size: 0.8rem; margin-top: 0.25rem; display: block; }
    .error-banner {
      background: color-mix(in srgb, var(--color-danger) 10%, transparent);
      color: var(--color-danger);
      padding: 0.75rem; border-radius: var(--radius-md);
      font-size: 0.875rem; text-align: center; margin-top: 0.75rem;
    }
    .auth-footer {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.875rem;
      color: var(--color-text-muted);
      display: flex; gap: 0.375rem; justify-content: center;
    }
    .link-text { color: var(--color-primary); font-weight: 600; text-decoration: none; }
    .link-text:hover { text-decoration: underline; }
  `],
})
export class LoginComponent {
  private readonly fb      = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly auth    = inject(AuthService);
  private readonly router  = inject(Router);
  private readonly toast   = inject(ToastService);

  loading     = signal(false);
  showPassword = signal(false);
  errorMsg    = signal('');

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');

    const { email, password } = this.form.getRawValue();
    this.authApi.login({ email: email!, password: password! }).subscribe({
      next: (res) => {
        this.auth.setTokens(res.accessToken, res.refreshToken, res.expiresAt);
        this.auth.setUser(res.user);
        this.toast.success(`Welcome back, ${res.user.firstName}! 👋`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMsg.set(err.message ?? 'Invalid email or password');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
