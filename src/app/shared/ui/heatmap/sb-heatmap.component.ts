import { Component, ChangeDetectionStrategy, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyTrendDto } from '@shared/models/reports.models';

export interface HeatmapDay {
  date: Date;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  tooltip: string;
}

@Component({
  selector: 'sb-heatmap',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sb-heatmap.component.html',
  styleUrl: './sb-heatmap.component.scss'
})
export class SbHeatmapComponent {
  data = input<DailyTrendDto[]>([]);
  year = input<number>(new Date().getFullYear());

  weeksCount = signal(53);

  weeks = computed(() => {
    const trend = this.data();
    const targetYear = this.year();

    const dataMap = new Map<string, number>();
    trend.forEach(d => {
      const dateKey = d.date.split('T')[0];
      dataMap.set(dateKey, (dataMap.get(dateKey) || 0) + d.totalSeconds);
    });

    const weeks: HeatmapDay[][] = [];
    const startDate = new Date(targetYear, 0, 1);

    const firstDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - firstDay);

    const endDate = new Date(targetYear, 11, 31);
    const lastDay = endDate.getDay();
    endDate.setDate(endDate.getDate() + (6 - lastDay));

    let current = new Date(startDate);
    let currentWeek: HeatmapDay[] = [];

    while (current <= endDate) {
      const dateKey = current.toISOString().split('T')[0];
      const seconds = dataMap.get(dateKey) || 0;

      currentWeek.push({
        date: new Date(current),
        count: seconds,
        level: this.calculateLevel(seconds),
        tooltip: `${seconds > 0 ? this.formatDuration(seconds) : 'No sessions'} on ${current.toLocaleDateString()}`
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      current.setDate(current.getDate() + 1);
    }

    if (currentWeek.length > 0) weeks.push(currentWeek);
    return weeks;
  });

  monthLabels = computed(() => {
    const weeksList = this.weeks();
    const labels: { name: string, col: number }[] = [];
    let lastMonth = -1;

    weeksList.forEach((week, index) => {
      const firstDayOfMonth = week.find(d => d.date.getDate() <= 7);
      if (firstDayOfMonth) {
        const month = firstDayOfMonth.date.getMonth();
        if (month !== lastMonth) {
          labels.push({
            name: firstDayOfMonth.date.toLocaleString('en-US', { month: 'short' }),
            col: index + 1
          });
          lastMonth = month;
        }
      }
    });

    return labels;
  });

  private calculateLevel(seconds: number): 0 | 1 | 2 | 3 | 4 {
    if (seconds === 0) return 0;
    if (seconds < 3600) return 1;
    if (seconds < 3600 * 3) return 2;
    if (seconds < 3600 * 6) return 3;
    return 4;
  }

  private formatDuration(s: number): string {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }
}
