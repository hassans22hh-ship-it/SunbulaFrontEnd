import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { TimeSessionApiService } from '../timer/services/time-session.api.service';
import { TimeSessionDto } from '@shared/models/timer.models';
import { SbCardComponent } from '@shared/ui/card/sb-card.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbBehaviorBadgeComponent } from '@shared/ui/behavior-badge/sb-behavior-badge.component';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { DatePipe } from '@angular/common';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';

interface DayGroup { date: string; sessions: TimeSessionDto[]; totalSeconds: number; }

@Component({
  selector: 'sb-timeline',
  standalone: true,
  imports: [SbCardComponent, SbEmptyStateComponent, SbSpinnerComponent, SbBehaviorBadgeComponent, DurationPipe, DatePipe, PageTransitionDirective],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent implements OnInit {
  private readonly api = inject(TimeSessionApiService);
  readonly loading     = signal(true);
  readonly days        = signal<DayGroup[]>([]);

  ngOnInit(): void {
    this.api.getAll().subscribe({
      next: sessions => {
        this.days.set(this.groupByDay(sessions));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private groupByDay(sessions: TimeSessionDto[]): DayGroup[] {
    const map = new Map<string, TimeSessionDto[]>();
    for (const s of sessions) {
      const date = s.startTime.substring(0, 10);
      const group = map.get(date) ?? [];
      group.push(s);
      map.set(date, group);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, sessions]) => ({
        date,
        sessions,
        totalSeconds: sessions.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0),
      }));
  }
}
