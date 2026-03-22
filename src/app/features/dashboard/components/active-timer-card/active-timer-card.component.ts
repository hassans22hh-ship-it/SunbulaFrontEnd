import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TimerStore } from '@features/timer/store/timer.store';
import { DurationPipe } from '@shared/pipes/duration.pipe';

@Component({
  selector: 'sb-active-timer-card',
  standalone: true,
  imports: [RouterLink, DurationPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './active-timer-card.component.html',
  styleUrl: './active-timer-card.component.css',
})
export class ActiveTimerCardComponent {
  protected readonly store = inject(TimerStore);
}
