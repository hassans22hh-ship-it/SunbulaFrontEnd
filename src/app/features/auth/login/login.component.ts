/* features/auth/login/login.component.ts */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { GsapService } from '../../../core/animation/gsap.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'sb-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <div class="min-h-screen bg-bg flex items-center justify-center p-4">
      <div class="card w-full max-w-md space-y-8 p-8" id="login-card">
        <div class="text-center">
          <h1 class="text-3xl font-display font-extrabold text-primary">Welcome Back</h1>
          <p class="text-text-muted mt-2">Log in to your Sunbula account</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="space-y-1">
            <label for="email" class="text-sm font-semibold text-text">Email Address</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="w-full p-3 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="you@example.com"
            />
            <p *ngIf="email?.touched && email?.errors?.['required']" class="text-danger text-xs mt-1">Email is required</p>
            <p *ngIf="email?.touched && email?.errors?.['email']" class="text-danger text-xs mt-1">Invalid email format</p>
          </div>

          <div class="space-y-1">
            <label for="password" class="text-sm font-semibold text-text">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="w-full p-3 rounded-md border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="••••••••"
            />
            <p *ngIf="password?.touched && password?.errors?.['required']" class="text-danger text-xs mt-1">Password is required</p>
          </div>

          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" class="rounded border-border text-primary focus:ring-primary">
              <span class="text-text-muted">Remember me</span>
            </label>
            <a routerLink="/auth/forgot-password" class="text-primary hover:text-primary-light font-semibold">Forgot password?</a>
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid || isLoading()"
            class="btn-primary w-full py-4 text-lg"
          >
            {{ isLoading() ? 'Logging in...' : 'Log In' }}
          </button>
        </form>

        <p class="text-center text-sm text-text-muted">
          Don't have an account?
          <a routerLink="/auth/register" class="text-primary hover:text-primary-light font-semibold">Create an account</a>
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly gsap = inject(GsapService);

  isLoading = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  ngAfterViewInit() {
    this.gsap.modalIn('#login-card');
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    try {
      // Mock login since we don't have the auth.api.service.ts yet
      // In a real scenario, we'd call auth.login() which calls the API
      console.log('Login implementation pending auth service wiring');
      // For now, let's just simulate success after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
