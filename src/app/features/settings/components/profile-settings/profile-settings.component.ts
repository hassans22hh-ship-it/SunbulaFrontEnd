import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { SettingsApiService, UpdateProfileDto } from '../../services/settings.api.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { SbButtonComponent } from '../../../../shared/ui/button/sb-button.component';

@Component({
  selector: 'sb-profile-settings',
  standalone: true,
  imports: [ReactiveFormsModule, SbButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-surface border border-border rounded-2xl p-6 shadow-sm">
      <h3 class="font-semibold text-lg text-text mb-4">Edit Profile</h3>
      
      <div class="flex items-center gap-6 mb-8">
        <div class="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold border-2 border-surface shadow-sm relative">
           {{ getInitial() }}
           <button class="absolute bottom-0 right-[-4px] w-7 h-7 bg-surface-2 border border-border rounded-full flex items-center justify-center text-xs shadow-sm hover:bg-border transition-colors">
             ✏️
           </button>
        </div>
        <div>
          <div class="font-medium text-text">{{ auth.user()?.fullName }}</div>
          <div class="text-sm text-subtle">{{ auth.user()?.email }}</div>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="form-group">
            <label class="label-text">Username</label>
            <input class="input-field" type="text" formControlName="username">
          </div>
          <div class="form-group">
            <label class="label-text">Email Address</label>
            <input class="input-field" type="email" formControlName="email">
            <!-- Technically email change might require re-verification based on backend, keeping it simple -->
          </div>
        </div>

        <div class="form-group mb-6 max-w-md">
          <label class="label-text">New Password (leave blank to keep current)</label>
          <input class="input-field" type="password" formControlName="password" placeholder="••••••••">
        </div>

        <div class="flex justify-end">
          <sb-button type="submit" [disabled]="form.invalid || form.pristine || saving()">
            {{ saving() ? 'Saving...' : 'Save Profile Changes' }}
          </sb-button>
        </div>

      </form>
    </div>
  `,
  styles: [`
    .text-text { color: var(--color-text); }
    .text-subtle { color: var(--color-text-muted); }
    .bg-surface { background: var(--color-surface); }
    .bg-surface-2 { background: var(--color-surface-2); }
    .border-border { border-color: var(--color-border); }
    .border-surface { border-color: var(--color-surface); }
    
    .bg-primary\\/10 { background: color-mix(in srgb, var(--color-primary) 10%, transparent); }
    .text-primary { color: var(--color-primary); }
  `]
})
export class ProfileSettingsComponent {
  protected readonly auth = inject(AuthService);
  private readonly api = inject(SettingsApiService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  saving = signal(false);

  private get profileName(): string {
    return this.auth.user()?.fullName ?? '';
  }

  form = this.fb.group({
    username: [this.profileName, Validators.required],
    email:    [this.auth.user()?.email || '', [Validators.required, Validators.email]],
    password: ['']
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
    
    const dto: UpdateProfileDto = {};
    if (v.username !== this.profileName) dto.username = v.username!;
    if (v.email !== this.auth.user()?.email) dto.email = v.email!;
    if (v.password) dto.password = v.password!;

    this.api.updateProfile(dto).subscribe({
      next: () => {
        this.toast.success('Profile updated successfully.');
        this.form.markAsPristine();
        this.saving.set(false);
        // We'd ideally refresh the token or user object here. For now rely on local change effect.
        if (dto.password) {
          this.form.patchValue({ password: '' }); 
        }
      },
      error: (_err: unknown) => {
        this.saving.set(false);
        // Error intercepted by global interceptor, so toast already shown.
      }
    });
  }
}
