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
  template: `
    <div class="heatmap-container">
      <div class="heatmap-header">
        <div class="month-labels">
          @for (month of monthLabels(); track $index) {
            <span class="month-label" [style.grid-column-start]="month.col">
              {{ month.name }}
            </span>
          }
        </div>
      </div>
      
      <div class="heatmap-body">
        <div class="day-labels">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
        </div>
        
        <div class="heatmap-grid" [style.grid-template-columns]="'repeat(' + weeksCount() + ', 1fr)'">
          @for (week of weeks(); track $index) {
            <div class="heatmap-week">
              @for (day of week; track day.date) {
                <div 
                  class="heatmap-day" 
                  [class]="'level-' + day.level"
                  [attr.data-date]="day.date | date:'yyyy-MM-dd'"
                  [title]="day.tooltip">
                </div>
              }
            </div>
          }
        </div>
      </div>

      <div class="heatmap-footer">
        <span class="footer-msg">Learn how we count contributions</span>
        <div class="legend">
          <span>Less</span>
          <div class="heatmap-day level-0"></div>
          <div class="heatmap-day level-1"></div>
          <div class="heatmap-day level-2"></div>
          <div class="heatmap-day level-3"></div>
          <div class="heatmap-day level-4"></div>
          <span>More</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    
    .heatmap-container {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: 1.5rem;
      font-family: var(--font-main);
      overflow-x: auto;
    }

    .heatmap-header { margin-bottom: 0.5rem; }
    
    .month-labels {
      display: grid;
      grid-template-columns: repeat(53, 1fr);
      gap: 4px;
      margin-left: 35px;
      font-size: 10px;
      color: var(--color-text-muted);
      font-weight: 600;
    }

    .month-label { text-align: left; }

    .heatmap-body {
      display: flex;
      gap: 10px;
    }

    .day-labels {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 98px; /* 7 * (12px + 2px gap) */
      font-size: 10px;
      color: var(--color-text-muted);
      font-weight: 600;
      padding-top: 2px;
    }

    .heatmap-grid {
      display: grid;
      gap: 4px;
      flex: 1;
    }

    .heatmap-week {
      display: grid;
      grid-template-rows: repeat(7, 12px);
      gap: 4px;
    }

    .heatmap-day {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      background: var(--color-surface-3);
      border: 1px solid rgba(0,0,0,0.05);
      transition: transform 0.1s ease;
      cursor: pointer;

      &:hover {
        transform: scale(1.2);
        z-index: 10;
        border-color: var(--color-primary);
      }

      &.level-0 { background: var(--color-surface-3); }
      &.level-1 { background: #9be9a8; }
      &.level-2 { background: #40c463; }
      &.level-3 { background: #30a14e; }
      &.level-4 { background: #216e39; }
    }

    /* Dark Mode Overrides if needed */
    :host-context(.dark-theme) {
       .heatmap-day.level-0 { background: rgba(255,255,255,0.05); }
       .heatmap-day.level-1 { background: #0e4429; }
       .heatmap-day.level-2 { background: #006d32; }
       .heatmap-day.level-3 { background: #26a641; }
       .heatmap-day.level-4 { background: #39d353; }
    }

    .heatmap-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      font-size: 11px;
      color: var(--color-text-muted);
    }

    .legend {
      display: flex;
      align-items: center;
      gap: 4px;
      span { margin: 0 4px; }
      .heatmap-day { cursor: default; &:hover { transform: none; } }
    }
  `]
})
export class SbHeatmapComponent {
  data = input<DailyTrendDto[]>([]);
  year = input<number>(new Date().getFullYear());

  weeksCount = signal(53);

  weeks = computed(() => {
    const trend = this.data();
    const targetYear = this.year();
    
    // Create a map for quick lookup
    const dataMap = new Map<string, number>();
    trend.forEach(d => {
      const dateKey = d.date.split('T')[0];
      dataMap.set(dateKey, (dataMap.get(dateKey) || 0) + d.totalSeconds);
    });

    const weeks: HeatmapDay[][] = [];
    const startDate = new Date(targetYear, 0, 1);
    
    // Find the first Sunday/Monday of the year. GitHub uses Sunday.
    // Let's go back to the start of the inclusive week.
    const firstDay = startDate.getDay(); // 0 is Sunday
    startDate.setDate(startDate.getDate() - firstDay);

    const endDate = new Date(targetYear, 11, 31);
    // Go to the end of the inclusive week
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
    if (seconds < 3600) return 1; // < 1h
    if (seconds < 3600 * 3) return 2; // < 3h
    if (seconds < 3600 * 6) return 3; // < 6h
    return 4; // > 6h
  }

  private formatDuration(s: number): string {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }
}
