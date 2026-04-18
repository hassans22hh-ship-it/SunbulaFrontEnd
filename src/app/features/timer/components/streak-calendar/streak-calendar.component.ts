import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sb-streak-calendar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './streak-calendar.component.html',
  styleUrl: './streak-calendar.component.scss'
})
export class SbStreakCalendarComponent {
  currentStreak = input<number>(0);
  history = input<any[]>([]);

  displayDays = computed(() => {
    const hist = this.history() || [];
    const days = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const session = hist.find((h: any) => h.date && h.date.startsWith(dateStr));
      const isActive = session ? (session.totalTrackedSeconds > 0 || session.totalMinutes > 0) : false;

      days.push({
        date: dateStr,
        label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        isToday: i === 0,
        isFuture: false,
        isActive,
        tooltip: isActive
          ? `Tracked on ${dateStr}`
          : (i === 0 ? 'Not tracked yet today' : `Missed on ${dateStr}`)
      });
    }

    return days;
  });
}
