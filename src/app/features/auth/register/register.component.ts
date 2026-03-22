import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly fb      = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly auth    = inject(AuthService);
  private readonly router  = inject(Router);
  private readonly toast   = inject(ToastService);

  loading  = signal(false);
  errorMsg = signal('');
  showPassword = signal(false);

  form = this.fb.group({
    firstName:       ['', Validators.required],
    lastName:        ['', Validators.required],
    email:           ['', [Validators.required, Validators.email]],
    phone:           [''],
    password:        ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: confirmPasswordValidator() });

  get f() { return this.form.controls; }

  // Track password value for strength meter
  passwordValue = toSignal(this.form.controls.password.valueChanges, { initialValue: '' });

  strengthScore = computed(() => {
    const pw = this.passwordValue() || '';
    if (pw.length === 0) return 0;
    if (pw.length < 8) return 1;
    const hasLetter = /[a-zA-Z]/.test(pw);
    const hasNum = /[0-9]/.test(pw);
    const hasSpec = /[^a-zA-Z0-9]/.test(pw);
    let score = 1;
    if (pw.length >= 8 && hasLetter && (hasNum || hasSpec)) {
      score = 2;
    }
    if (score === 2 && hasSpec && hasNum) score = 3;
    // Just giving a quick functional feel
    if (pw.length >= 8) score = Math.max(score, 2); 
    if (pw.length >= 12 && hasNum && hasSpec) score = 3;
    return score;
  });

  strengthLabel = computed(() => {
    switch(this.strengthScore()) {
      case 0: return '';
      case 1: return 'Weak';
      case 2: return 'Fair Strength';
      case 3: return 'Strong';
      default: return '';
    }
  });

  strengthClass = computed(() => {
    switch(this.strengthScore()) {
      case 1: return 'strength-weak';
      case 2: return 'strength-fair';
      case 3: return 'strength-strong';
      default: return '';
    }
  });

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

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
