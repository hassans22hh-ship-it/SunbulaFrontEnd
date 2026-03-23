import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';

@Component({
  selector: 'sb-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SbButtonComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  private readonly fb = new FormBuilder();
  readonly loading = signal(false);
  readonly sent    = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    // TODO: When password reset API exists, call it here
    setTimeout(() => {
      this.loading.set(false);
      this.sent.set(true);
    }, 1000);
  }
}
