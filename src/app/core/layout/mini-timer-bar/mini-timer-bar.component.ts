import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TimerStore } from '@features/timer/store/timer.store';
import { DurationPipe } from '@shared/pipes/duration.pipe';

@Component({
  selector: 'sb-mini-timer-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, DurationPipe],
  templateUrl: './mini-timer-bar.component.html',
  styleUrl: './mini-timer-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniTimerBarComponent {
  protected readonly timer = inject(TimerStore);
}
