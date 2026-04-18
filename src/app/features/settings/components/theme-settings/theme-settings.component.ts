import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'sb-theme-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './theme-settings.component.html',
  styleUrl: './theme-settings.component.scss'
})
export class ThemeSettingsComponent {
  currentTheme = signal<'light' | 'dark'>(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme.set(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}
