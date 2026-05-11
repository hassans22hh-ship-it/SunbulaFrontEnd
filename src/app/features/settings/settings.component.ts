import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { AuthApiService } from '../auth/services/auth.api.service';
import { ThemeService } from '@core/theme/theme.service';
import { SettingsStore } from './store/settings.store';
import { SbCardComponent } from '@shared/ui/card/sb-card.component';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { ToastService } from '@shared/ui/toast/toast.service';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';

@Component({
  selector: 'sb-settings',
  standalone: true,
  imports: [SbCardComponent, SbButtonComponent, ReactiveFormsModule, PageTransitionDirective, RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  protected readonly auth  = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  protected readonly settingsStore = inject(SettingsStore);
  private readonly api     = inject(AuthApiService);
  private readonly fb      = inject(FormBuilder);
  private readonly toast   = inject(ToastService);
  readonly saving = signal(false);

  readonly profileForm = this.fb.nonNullable.group({
    firstName: [this.auth.user()?.firstName ?? '', Validators.required],
    lastName:  [this.auth.user()?.lastName ?? '', Validators.required],
    phone:     [this.auth.user()?.phone ?? '', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
  });

  readonly userSettingsForm = this.fb.nonNullable.group({
    timeZone:             ['', Validators.required],
    defaultCurrency:      ['', Validators.required],
    coinSystemEnabled:    [true],
    streakRewardsEnabled: [true],
  });

  ngOnInit(): void {
    this.settingsStore.loadSettings().then(() => {
      const s = this.settingsStore.userSettings();
      if (s) this.userSettingsForm.patchValue(s);
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.saving.set(true);
    this.api.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: user => { this.auth.setUser(user); this.saving.set(false); this.toast.success('Profile updated'); },
      error: () => { this.saving.set(false); this.toast.error('Failed to update profile'); },
    });
  }

  saveSettings(): void {
    if (this.userSettingsForm.invalid) return;
    this.settingsStore.updateSettings(this.userSettingsForm.getRawValue());
  }
}
