/* features/auth/login/login.component.ts */
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../services/auth.api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { GsapService } from '../../../core/animation/gsap.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'sb-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly gsap = inject(GsapService);

  isLoading = signal(false);
  showPassword = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
  readonly errorMsg = signal('');

  ngAfterViewInit() {
    this.gsap.modalIn('#login-card');
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMsg.set('');
    try {
      const value = this.loginForm.getRawValue();
      const res = await new Promise<{
        accessToken: string;
        refreshToken: string;
        expiresAt: string;
        user: unknown;
      }>((resolve, reject) => {
        this.authApi.login({
          email: value.email ?? '',
          password: value.password ?? '',
        }).subscribe({
          next: resolve,
          error: reject,
        });
      });

      this.auth.setTokens(res.accessToken, res.refreshToken, res.expiresAt);
      this.auth.setUser(res.user as Parameters<AuthService['setUser']>[0]);
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      const message =
        (error as { message?: string })?.message ??
        'Login failed. Please check your credentials.';
      this.errorMsg.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
