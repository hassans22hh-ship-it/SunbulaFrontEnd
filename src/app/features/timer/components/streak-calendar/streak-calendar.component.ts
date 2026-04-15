import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sb-streak-calendar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="streak-container">
      <div class="streak-header">
        <h3 class="streak-title">🔥 Current Streak</h3>
        <span class="streak-count">{{ currentStreak() }} Days</span>
      </div>
      
      <div class="streak-days">
        @for (day of displayDays(); track day.date) {
          <div class="streak-day" [class.is-today]="day.isToday">
            <span class="day-label">{{ day.label }}</span>
            <div 
              class="day-circle" 
              [class.active]="day.isActive"
              [class.missed]="!day.isActive && !day.isToday && !day.isFuture"
              [class.future]="day.isFuture"
              [title]="day.tooltip"
            >
              @if (day.isActive) {
                <i class="fa-solid fa-fire text-amber-500"></i>
              } @else if (day.isToday) {
                <div class="today-dot"></div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .streak-container {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: 1.5rem;
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-sm);
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .streak-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      .streak-title {
        font-weight: 700;
        font-size: 1.1rem;
        margin: 0;
        color: var(--color-text);
      }

      .streak-count {
        font-weight: 800;
        color: var(--color-primary);
        background: color-mix(in srgb, var(--color-primary) 15%, transparent);
        padding: 0.25rem 0.75rem;
        border-radius: 99px;
      }
    }

    .streak-days {
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
      width: 100%;
    }

    .streak-day {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      flex: 1;

      .day-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--color-text-muted);
      }

      &.is-today .day-label {
        color: var(--color-primary);
        font-weight: 800;
      }

      .day-circle {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-surface-2);
        border: 2px solid transparent;
        transition: all 0.2s ease;
        font-size: 1rem;

        &.active {
          background: rgba(245, 158, 11, 0.1); /* Amber 500 at 10% */
          border-color: #F59E0B; /* Amber 500 */
        }

        &.missed {
          background: rgba(var(--color-danger-rgb, 239, 68, 68), 0.05);
          border-color: rgba(var(--color-danger-rgb, 239, 68, 68), 0.2);
        }

        &.future {
          opacity: 0.5;
          border-color: var(--color-border);
        }
      }

      .today-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--color-primary);
      }
    }
  `]
})
export class SbStreakCalendarComponent {
  currentStreak = input<number>(0);
  history = input<any[]>([]); // DailySummaryDto[]

  displayDays = computed(() => {
    const hist = this.history() || [];
    const days = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const session = hist.find(h => h.date && h.date.startsWith(dateStr));
      
      // Assume qualify if there is > 0 tracked minutes/seconds
      const isActive = session ? (session.totalTrackedSeconds > 0 || session.totalMinutes > 0) : false;

      days.push({
        date: dateStr,
        label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        isToday: i === 0,
        isFuture: false, // We only go back 6 days + today
        isActive,
        tooltip: isActive 
          ? `Tracked on ${dateStr}` 
          : (i === 0 ? 'Not tracked yet today' : `Missed on ${dateStr}`)
      });
    }
    
    return days;
  });
}
