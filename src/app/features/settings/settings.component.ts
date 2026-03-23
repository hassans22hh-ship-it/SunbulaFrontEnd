import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@core/auth/auth.service';
import { AuthApiService } from '../auth/services/auth.api.service';
import { ThemeService } from '@core/theme/theme.service';
import { SbCardComponent } from '@shared/ui/card/sb-card.component';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { ToastService } from '@shared/ui/toast/toast.service';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';

@Component({
  selector: 'sb-settings',
  standalone: true,
  imports: [SbCardComponent, SbButtonComponent, ReactiveFormsModule, PageTransitionDirective],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  protected readonly auth  = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  private readonly api     = inject(AuthApiService);
  private readonly fb      = inject(FormBuilder);
  private readonly toast   = inject(ToastService);
  readonly saving = signal(false);

  readonly profileForm = this.fb.nonNullable.group({
    firstName: [this.auth.user()?.firstName ?? '', Validators.required],
    lastName:  [this.auth.user()?.lastName ?? '', Validators.required],
    phone:     [this.auth.user()?.phone ?? ''],
  });

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.saving.set(true);
    this.api.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: user => { this.auth.setUser(user); this.saving.set(false); this.toast.success('Profile updated'); },
      error: () => { this.saving.set(false); this.toast.error('Failed to update profile'); },
    });
  }
}
