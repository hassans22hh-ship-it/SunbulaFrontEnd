import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
  template: `
    <div class="session-list p-4 bg-surface rounded-xl border border-border mt-8">
      <h3 class="text-lg font-semibold mb-4 px-2 tracking-tight">Today's History</h3>
      
      @if (store.todaysSessions().length === 0) {
        <div class="text-center py-6 text-subtle text-sm">
          No sessions recorded today yet.<br>Start focusing to earn coins!
        </div>
      } @else {
        <div class="space-y-2">
          @for (session of store.todaysSessions(); track session.id) {
            <div class="session-item flex items-center justify-between p-3 rounded-lg hover:bg-surface-2 transition-colors">
              <div class="flex items-center gap-4">
                <sb-behavior-badge [behavior]="session.behaviorType" />
                <div>
                  <div class="text-sm font-medium text-text">
                    {{ session.duration | duration:'text' }}
                  </div>
                  <div class="text-xs text-subtle">
                    {{ session.startTime | date:'shortTime' }}
                    @if (session.notes) { <span class="ml-1 opacity-70">— {{ session.notes }}</span> }
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-4">
                <div class="text-warning font-medium text-sm">
                  +{{ session.coinsEarned | coins:false }} 🪙
                </div>
                <button class="text-danger opacity-50 hover:opacity-100 text-xs px-2" (click)="deleteSession(session.id)">
                  ✕
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .text-subtle { color: var(--color-text-muted); }
    .text-text { color: var(--color-text); }
    .text-warning { color: var(--color-warning); }
    .text-danger { color: var(--color-danger); }
    .bg-surface { background: var(--color-surface); }
    .bg-surface-2 { background: var(--color-surface-2); }
    .border-border { border-color: var(--color-border); }
  `]
})
export class SessionListComponent {
  protected readonly store = inject(TimerStore);

  deleteSession(id: string): void {
    if (confirm('Delete this session record?')) {
      this.store.removeSession(id);
    }
  }
}
