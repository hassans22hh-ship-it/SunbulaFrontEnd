import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'sb-day-navigator',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="day-navigator flex items-center justify-between bg-surface border border-border rounded-xl p-2 mb-6">
      <button class="nav-btn" (click)="previous.emit()" title="Previous Day">←</button>
      
      <div class="text-center font-medium">
        @if (isToday()) {
          <span class="text-primary font-bold">Today</span>
        } @else {
          <span class="text-text">{{ date() | date:'mediumDate' }}</span>
        }
      </div>

      <button class="nav-btn" [disabled]="isToday()" (click)="next.emit()" title="Next Day">
        →
      </button>
    </div>
  `,
  styles: [`
    .nav-btn {
      width: 36px; height: 36px;
      border-radius: var(--radius-md);
      border: none;
      background: var(--color-surface-2);
      color: var(--color-text);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
    }
    .nav-btn:hover:not(:disabled) { background: var(--color-border); }
    .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .text-text { color: var(--color-text); }
  `]
})
export class DayNavigatorComponent {
  date = input.required<Date>();
  
  previous = output<void>();
  next     = output<void>();

  isToday(): boolean {
    const today = new Date();
    const d = this.date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  }
}
