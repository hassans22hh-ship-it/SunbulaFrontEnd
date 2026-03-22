import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'sb-stats-bar',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stats-bar.component.html',
  styleUrl: './stats-bar.component.css',
})
export class StatsBarComponent {
  tasksCompleted   = input<number>(0);
  focusTimeSecs    = input<number>(0);
  streakDays       = input<number>(0);
  coinsEarnedToday = input<number>(0);

  focusHoursToday() { return Math.floor(this.focusTimeSecs() / 3600); }
  focusMinsToday()  { return Math.floor((this.focusTimeSecs() % 3600) / 60); }
}
