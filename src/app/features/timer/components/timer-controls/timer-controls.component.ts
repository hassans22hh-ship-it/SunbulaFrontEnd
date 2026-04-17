import { ChangeDetectionStrategy, Component, output, input } from '@angular/core';
@Component({
  selector: 'app-timer-controls',
  standalone: true,
  imports: [],
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
