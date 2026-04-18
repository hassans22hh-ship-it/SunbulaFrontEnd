import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'sb-coin-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './coin-settings.component.html',
  styleUrl: './coin-settings.component.scss'
})
export class CoinSettingsComponent {
}
