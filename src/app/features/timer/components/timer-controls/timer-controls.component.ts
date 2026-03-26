import { ChangeDetectionStrategy, Component, output, input } from '@angular/core';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';

@Component({
  selector: 'app-timer-controls',
  standalone: true,
  imports: [SbButtonComponent],
  templateUrl: './timer-controls.component.html',
  styleUrl: './timer-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerControlsComponent {
  isPaused = input.required<boolean>();
  isLoading = input.required<boolean>();

  onPause = output<void>();
  onResume = output<void>();
  onStop = output<void>();
}
