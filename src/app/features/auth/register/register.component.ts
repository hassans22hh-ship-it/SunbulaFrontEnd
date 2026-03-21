import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../services/auth.api.service';
import { AuthService } from '@core/auth/auth.service';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { ToastService } from '@shared/ui/toast/toast.service';

function confirmPasswordValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const pw  = group.get('password')?.value;
    const cpw = group.get('confirmPassword')?.value;
    return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
  };
}

@Component({
  selector: 'sb-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SbButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-page">
      <div class="auth-card animate-scale-in">
        <div class="auth-header">
          <div class="auth-logo">🌻</div>
          <h1 class="auth-title">Create Account</h1>
          <p class="auth-subtitle">Join Sunbula and start your journey</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <!-- Name Row -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.125rem;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="label-text">First Name</label>
              <input class="input-field" type="text" formControlName="firstName" placeholder="Sara">
              @if (f['firstName'].touched && f['firstName'].hasError('required')) {
                <span class="error-text">Required</span>
              }
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="label-text">Last Name</label>
              <input class="input-field" type="text" formControlName="lastName" placeholder="Ahmed">
              @if (f['lastName'].touched && f['lastName'].hasError('required')) {
                <span class="error-text">Required</span>
              }
            </div>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label class="label-text">Email</label>
            <input class="input-field" type="email" formControlName="email" placeholder="you@example.com">
            @if (f['email'].touched && f['email'].hasError('required')) {
              <span class="error-text">Email is required</span>
            } @else if (f['email'].touched && f['email'].hasError('email')) {
              <span class="error-text">Enter a valid email</span>
            }
          </div>

          <!-- Phone (optional) -->
          <div class="form-group">
            <label class="label-text">Phone <span style="font-weight:400; opacity:0.6;">(optional)</span></label>
            <input class="input-field" type="tel" formControlName="phone" placeholder="+20 1234567890">
          </div>

          <!-- Password -->
          <div class="form-group">
            <label class="label-text">Password</label>
            <input class="input-field" type="password" formControlName="password" placeholder="Min. 8 characters">
            @if (f['password'].touched && f['password'].hasError('required')) {
              <span class="error-text">Password is required</span>
            } @else if (f['password'].touched && f['password'].hasError('minlength')) {
              <span class="error-text">At least 8 characters required</span>
            }
          </div>

          <!-- Confirm Password -->
          <div class="form-group">
            <label class="label-text">Confirm Password</label>
            <input class="input-field" type="password" formControlName="confirmPassword" placeholder="Repeat password">
            @if (f['confirmPassword'].touched && form.hasError('passwordMismatch')) {
              <span class="error-text">Passwords do not match</span>
            }
          </div>

          <sb-button type="submit" [loading]="loading()" [disabled]="form.invalid" [fullWidth]="true">
            Create Account
          </sb-button>

          @if (errorMsg()) {
            <p class="error-banner">{{ errorMsg() }}</p>
          }
        </form>

        <div class="auth-footer">
          <span>Already have an account?</span>
          <a routerLink="/auth/login" class="link-text">Sign in</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--color-bg); padding: 1.5rem; }
    .auth-card { width: 100%; max-width: 460px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); padding: 2.5rem; }
    .auth-header { text-align: center; margin-bottom: 2rem; }
    .auth-logo { font-size: 3rem; margin-bottom: 0.75rem; }
    .auth-title { font-family: var(--font-display); font-size: 1.75rem; font-weight: 800; color: var(--color-text); margin: 0 0 0.375rem; }
    .auth-subtitle { color: var(--color-text-muted); font-size: 0.9375rem; margin: 0; }
    .form-group { margin-bottom: 1.125rem; }
    .error-text { color: var(--color-danger); font-size: 0.8rem; margin-top: 0.25rem; display: block; }
    .error-banner { background: color-mix(in srgb, var(--color-danger) 10%, transparent); color: var(--color-danger); padding: 0.75rem; border-radius: var(--radius-md); font-size: 0.875rem; text-align: center; margin-top: 0.75rem; }
    .auth-footer { margin-top: 1.5rem; text-align: center; font-size: 0.875rem; color: var(--color-text-muted); display: flex; gap: 0.375rem; justify-content: center; }
    .link-text { color: var(--color-primary); font-weight: 600; text-decoration: none; }
    .link-text:hover { text-decoration: underline; }
  `],
})
export class RegisterComponent {
  private readonly fb      = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly auth    = inject(AuthService);
  private readonly router  = inject(Router);
  private readonly toast   = inject(ToastService);

  loading  = signal(false);
  errorMsg = signal('');

  form = this.fb.group({
    firstName:       ['', Validators.required],
    lastName:        ['', Validators.required],
    email:           ['', [Validators.required, Validators.email]],
    phone:           [''],
    password:        ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: confirmPasswordValidator() });

  get f() { return this.form.controls; }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');

    const v = this.form.getRawValue();
    this.authApi.register({
      firstName:       v.firstName!,
      lastName:        v.lastName!,
      email:           v.email!,
      password:        v.password!,
      confirmPassword: v.confirmPassword!,
      phone:           v.phone || undefined,
    }).subscribe({
      next: (res) => {
        this.auth.setTokens(res.accessToken, res.refreshToken, res.expiresAt);
        this.auth.setUser(res.user);
        this.toast.success('Account created! Welcome to Sunbula 🌻');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMsg.set(err.message ?? 'Registration failed. Please try again.');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
