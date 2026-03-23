import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../services/auth.api.service';
import { AuthService } from '@core/auth/auth.service';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { passwordStrengthValidator, passwordMatchValidator } from '@shared/validators/password.validator';

@Component({
  selector: 'sb-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SbButtonComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly api    = inject(AuthApiService);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    firstName:       ['', Validators.required],
    lastName:        ['', Validators.required],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator()]],
    confirmPassword: ['', Validators.required],
    phone:           [''],
  }, { validators: passwordMatchValidator });

  get pw() { return this.form.controls.password; }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    this.api.register(this.form.getRawValue()).subscribe({
      next: res => {
        this.auth.setTokens(res.accessToken, res.refreshToken, res.expiresAt);
        this.auth.setUser(res.user);
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.message ?? 'Registration failed');
      },
    });
  }
}
