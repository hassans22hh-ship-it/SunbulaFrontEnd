import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../services/auth.api.service';
import { AuthService } from '@core/auth/auth.service';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';

@Component({
  selector: 'sb-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SbButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb      = inject(FormBuilder);
  private readonly api     = inject(AuthApiService);
  private readonly auth    = inject(AuthService);
  private readonly router  = inject(Router);

  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    this.api.login(this.form.getRawValue()).subscribe({
      next: res => {
        this.auth.setTokens(res.accessToken, res.refreshToken, res.expiresAt);
        this.auth.setUser(res.user);
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.message ?? 'Login failed');
      },
    });
  }
}
