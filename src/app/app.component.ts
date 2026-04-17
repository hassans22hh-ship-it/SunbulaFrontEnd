import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HostListener } from '@angular/core';
import { environment } from '@env/environment';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly auth = inject(AuthService);

  @HostListener('window:beforeunload')
  onExit(): void {
    const token = this.auth.accessToken();
    if (!token) return;

    const url = `${environment.apiUrl}/api/v1/TimeSession/stop-active`;
    try {
      // fetch with keepalive supports Authorization headers unlike sendBeacon
      fetch(url, {
        method: 'POST',
        keepalive: true,
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Ignore — best-effort cleanup on tab close
    }
  }
}
