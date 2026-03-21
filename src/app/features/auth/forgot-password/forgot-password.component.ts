import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SbButtonComponent } from '../../../shared/ui/button/sb-button.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';

@Component({
  selector: 'sb-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SbButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-page">
      <div class="auth-card animate-scale-in">
        <div class="auth-header">
          <div class="auth-logo">🌻</div>
          <h1 class="auth-title">Reset Password</h1>
          <p class="auth-subtitle">Enter your email to receive a reset link</p>
        </div>

        @if (!submitted()) {
          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
            <div class="form-group">
              <label class="label-text">Email</label>
              <input class="input-field" type="email" formControlName="email" placeholder="you@example.com">
              @if (form.get('email')?.touched && form.get('email')?.hasError('required')) {
                <span class="error-text">Email is required</span>
              } @else if (form.get('email')?.touched && form.get('email')?.hasError('email')) {
                <span class="error-text">Enter a valid email</span>
              }
            </div>

            <sb-button type="submit" [loading]="loading()" [disabled]="form.invalid" [fullWidth]="true">
              Send Reset Link
            </sb-button>
          </form>
        } @else {
          <div style="text-align: center; padding: 1.5rem 0;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📬</div>
            <h3 style="font-size: 1.25rem; margin: 0 0 0.5rem;">Check your inbox</h3>
            <p style="color: var(--color-text-muted); font-size: 0.9375rem; margin: 0 0 1.5rem;">
              We've sent a password reset link to <strong>{{ form.value.email }}</strong>.
            </p>
            <sb-button variant="secondary" (clicked)="submitted.set(false)" [fullWidth]="true">
              Try another email
            </sb-button>
          </div>
        }

        <div class="auth-footer">
          <a routerLink="/auth/login" class="link-text">← Back to Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--color-bg); padding: 1.5rem; }
    .auth-card { width: 100%; max-width: 420px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: 2.5rem; }
    .auth-header { text-align: center; margin-bottom: 2rem; }
    .auth-logo { font-size: 3rem; margin-bottom: 0.75rem; }
    .auth-title { font-family: var(--font-display); font-size: 1.75rem; font-weight: 800; color: var(--color-text); margin: 0 0 0.375rem; }
    .auth-subtitle { color: var(--color-text-muted); font-size: 0.9375rem; margin: 0; }
    .form-group { margin-bottom: 1.5rem; }
    .error-text { color: var(--color-danger); font-size: 0.8rem; margin-top: 0.25rem; display: block; }
    .auth-footer { margin-top: 1.5rem; text-align: center; font-size: 0.875rem; }
    .link-text { color: var(--color-text-muted); font-weight: 500; text-decoration: none; transition: color 0.15s; }
    .link-text:hover { color: var(--color-primary); }
  `],
})
export class ForgotPasswordComponent {
  private readonly fb    = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  loading   = signal(false);
  submitted = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    
    // Simulate API call since there's no endpoint in the contract
    setTimeout(() => {
      this.loading.set(false);
      this.submitted.set(true);
      this.toast.info('Reset link sent to your email');
    }, 1500);
  }
}
