import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { AuthApiService } from '../../../auth/services/auth.api.service';
import { UpdateProfileDto } from '@shared/models/auth.models';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { SbButtonComponent } from '../../../../shared/ui/button/sb-button.component';

@Component({
  selector: 'sb-profile-settings',
  standalone: true,
  imports: [ReactiveFormsModule, SbButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-settings.component.html',
  styleUrl: './profile-settings.component.scss'
})
export class ProfileSettingsComponent {
  protected readonly auth = inject(AuthService);
  private readonly authApi = inject(AuthApiService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  saving = signal(false);

  private get profileName(): string {
    return this.auth.user()?.fullName ?? '';
  }

  form = this.fb.group({
    firstName: [this.auth.user()?.firstName || '', Validators.required],
    lastName:  [this.auth.user()?.lastName || '', Validators.required]
  });

  getInitial(): string {
    const name = this.profileName.trim();
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  }

  onSubmit(): void {
    if (this.form.invalid || this.form.pristine) return;

    this.saving.set(true);
    const v = this.form.value;

    const dto: UpdateProfileDto = {
      firstName: v.firstName!,
      lastName: v.lastName!
    };

    this.authApi.updateProfile(dto).subscribe({
      next: () => {
        this.toast.success('Profile updated successfully.');
        this.form.markAsPristine();
        this.saving.set(false);
        this.auth.refreshUserProfile();
      },
      error: (_err: unknown) => {
        this.saving.set(false);
      }
    });
  }
}
