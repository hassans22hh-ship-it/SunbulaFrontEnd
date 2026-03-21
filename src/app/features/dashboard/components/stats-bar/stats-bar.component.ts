import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'sb-stats-bar',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      
      <!-- Total Tasks Done -->
      <div class="stat-card">
        <div class="stat-icon bg-success-light text-success">✅</div>
        <div class="stat-info">
          <div class="stat-value">{{ tasksCompleted() }}</div>
          <div class="stat-label">Tasks Completed</div>
        </div>
      </div>

      <!-- Focus Time Today -->
      <div class="stat-card">
        <div class="stat-icon bg-primary-light text-primary">⏱️</div>
        <div class="stat-info">
          <div class="stat-value">{{ focusHoursToday() }}<span class="text-sm font-normal text-subtle">h</span> {{ focusMinsToday() }}<span class="text-sm font-normal text-subtle">m</span></div>
          <div class="stat-label">Focus Today</div>
        </div>
      </div>

      <!-- Current Streak -->
      <div class="stat-card">
        <div class="stat-icon bg-warning-light text-warning">🔥</div>
        <div class="stat-info">
          <div class="stat-value">{{ streakDays() }}</div>
          <div class="stat-label">Day Streak</div>
        </div>
      </div>

      <!-- Coins Earned Today (Calculated roughly or passed) -->
      <div class="stat-card">
        <div class="stat-icon bg-accent-light text-accent">🪙</div>
        <div class="stat-info">
          <div class="stat-value">{{ coinsEarnedToday() }}</div>
          <div class="stat-label">Earned Today</div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .stat-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--shadow-sm);
    }
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    .bg-success-light { background: color-mix(in srgb, var(--color-success) 15%, transparent); }
    .bg-primary-light { background: color-mix(in srgb, var(--color-primary) 15%, transparent); }
    .bg-warning-light { background: color-mix(in srgb, var(--color-warning) 15%, transparent); }
    .bg-accent-light  { background: color-mix(in srgb, var(--color-accent) 15%, transparent); }
    
    .text-success { color: var(--color-success); }
    .text-primary { color: var(--color-primary); }
    .text-warning { color: var(--color-warning); }
    .text-accent  { color: var(--color-accent); }

    .stat-value {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-text);
      line-height: 1.2;
    }
    .stat-label {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      font-weight: 500;
    }
    .text-subtle { color: var(--color-text-muted); }
  `]
})
export class StatsBarComponent {
  tasksCompleted   = input<number>(0);
  focusTimeSecs    = input<number>(0);
  streakDays       = input<number>(0);
  coinsEarnedToday = input<number>(0);

  focusHoursToday() { return Math.floor(this.focusTimeSecs() / 3600); }
  focusMinsToday()  { return Math.floor((this.focusTimeSecs() % 3600) / 60); }
}
