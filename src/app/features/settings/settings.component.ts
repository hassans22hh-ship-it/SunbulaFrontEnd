import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ProfileSettingsComponent } from './components/profile-settings/profile-settings.component';
import { ThemeSettingsComponent } from './components/theme-settings/theme-settings.component';
import { CoinSettingsComponent } from './components/coin-settings/coin-settings.component';
import { AnimateDirective } from '@shared/directives/animate.directive';

@Component({
  selector: 'sb-settings',
  standalone: true,
  imports: [
    ProfileSettingsComponent,
    ThemeSettingsComponent,
    CoinSettingsComponent,
    AnimateDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col pt-6 pb-8" sbPage>
      
      <div class="mb-8" sbAnimate="slideLeft">
        <h2 class="section-title">Settings</h2>
        <p class="text-subtle mt-1 text-sm">Manage your account preferences and application appearance.</p>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div class="max-w-4xl space-y-8 pb-12">
          
          <!-- Profile Section -->
          <section sbAnimate="fadeUp">
            <sb-profile-settings />
          </section>

          <!-- Appearance Section -->
          <section sbAnimate="fadeUp" style="animation-delay: 0.1s;">
            <sb-theme-settings />
          </section>

          <!-- Economy Section -->
          <section sbAnimate="fadeUp" style="animation-delay: 0.2s;">
            <sb-coin-settings />
          </section>

          <!-- Danger Zone / About (Optional/Static) -->
          <div sbAnimate="fadeUp" style="animation-delay: 0.3s;" class="pt-4 border-t border-border flex justify-between items-center opacity-70">
            <div class="text-xs text-subtle italic">Sunbula v1.0.0-release</div>
            <button class="text-xs text-danger font-medium hover:underline">Delete Account</button>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .text-subtle { color: var(--color-text-muted); }
    .border-border { border-color: var(--color-border); }
    .text-danger { color: var(--color-danger); }

    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
  `]
})
export class SettingsComponent implements OnInit {
  private readonly titleService = inject(Title);

  ngOnInit(): void {
    this.titleService.setTitle('Settings | Sunbula');
  }
}
