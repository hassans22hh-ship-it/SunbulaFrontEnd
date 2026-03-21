import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TimerStore } from '@features/timer/store/timer.store';
import { DurationPipe } from '@shared/pipes/duration.pipe';

@Component({
  selector: 'sb-active-timer-card',
  standalone: true,
  imports: [RouterLink, DurationPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="active-card h-full" [class.is-running]="store.currentTimer().isRunning">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="font-semibold" [style.color]="store.currentTimer().isRunning ? 'var(--color-primary)' : 'var(--color-text)'">
            {{ store.currentTimer().isRunning ? 'Timer Running' : 'Timer Ready' }}
          </h3>
          <p class="text-xs mt-1 opacity-80">Jump back into deep work.</p>
        </div>
        
        @if (store.currentTimer().isRunning) {
          <div class="pulse-indicator"></div>
        }
      </div>

      <div class="timer-display my-6 text-center">
        {{ store.currentTimer().elapsedSecs | duration:'clock' }}
      </div>

      <a routerLink="/timer" class="action-btn">
        {{ store.currentTimer().isRunning ? 'Go to Timer →' : 'Start Focus Session' }}
      </a>
    </div>
  `,
  styles: [`
    .active-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-sm);
      position: relative;
      overflow: hidden;
      transition: border-color 0.3s, box-shadow 0.3s;
    }
    .active-card.is-running {
      border-color: color-mix(in srgb, var(--color-primary) 50%, var(--color-border));
      box-shadow: 0 4px 20px color-mix(in srgb, var(--color-primary) 10%, transparent);
    }
    .active-card.is-running::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; height: 4px;
      background: var(--color-primary);
    }

    .pulse-indicator {
      width: 12px; height: 12px;
      border-radius: 50%;
      background: var(--color-primary);
      animation: pulseGlow 2s infinite ease-in-out;
    }

    .timer-display {
      font-family: var(--font-mono);
      font-size: 2.75rem;
      font-weight: 700;
      color: var(--color-text);
      letter-spacing: -1px;
    }
    .is-running .timer-display { color: var(--color-primary); }

    .action-btn {
      margin-top: auto;
      display: block;
      text-align: center;
      background: var(--color-surface-2);
      color: var(--color-text);
      text-decoration: none;
      padding: 0.75rem;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 600;
      transition: background 0.2s, color 0.2s;
    }
    .action-btn:hover {
      background: var(--color-primary);
      color: white;
    }
    .is-running .action-btn {
      background: color-mix(in srgb, var(--color-primary) 15%, transparent);
      color: var(--color-primary);
    }
    .is-running .action-btn:hover {
      background: var(--color-primary);
      color: white;
    }
  `]
})
export class ActiveTimerCardComponent {
  protected readonly store = inject(TimerStore);
}
