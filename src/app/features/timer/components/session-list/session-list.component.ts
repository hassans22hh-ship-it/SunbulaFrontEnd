import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TimerStore } from '../../store/timer.store';
import { DatePipe } from '@angular/common';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { CoinsPipe } from '@shared/pipes/coins.pipe';
import { SbBehaviorBadgeComponent } from '@shared/ui/behavior-badge/sb-behavior-badge.component';

@Component({
  selector: 'sb-session-list',
  standalone: true,
  imports: [DatePipe, DurationPipe, CoinsPipe, SbBehaviorBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './session-list.component.html',
  styleUrl: './session-list.component.css',
})
export class SessionListComponent {
  protected readonly store = inject(TimerStore);

  deleteSession(id: string): void {
    if (confirm('Delete this session record?')) {
      this.store.removeSession(id);
    }
  }
}
