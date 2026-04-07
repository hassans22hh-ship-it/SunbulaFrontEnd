import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HostListener } from '@angular/core';
import { environment } from '@env/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  @HostListener('window:beforeunload')
  onExit() {
    // Attempt to stop active session cleanly when browser closes via sendBeacon
    const url = `${environment.apiUrl}/api/v1/TimeSession/stop-active`;
    try {
      // Beacon is highly reliable for tab closures as it runs detached
      navigator.sendBeacon(url);
    } catch {
      // Ignore
    }
  }
}
