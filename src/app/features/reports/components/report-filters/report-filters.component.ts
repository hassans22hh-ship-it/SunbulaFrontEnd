import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';

export type ReportPeriod = '7d' | '30d' | '90d';

@Component({
  selector: 'sb-report-filters',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex gap-2 p-1 bg-surface-2 rounded-lg border border-border inline-flex">
      <button 
        class="filter-btn" 
        [class.active]="selected() === '7d'" 
        (click)="select('7d')"
      >
        Last 7 Days
      </button>
      <button 
        class="filter-btn" 
        [class.active]="selected() === '30d'" 
        (click)="select('30d')"
      >
        Last 30 Days
      </button>
      <button 
        class="filter-btn" 
        [class.active]="selected() === '90d'" 
        (click)="select('90d')"
      >
        Last 3 Months
      </button>
    </div>
  `,
  styles: [`
    .filter-btn {
      padding: 0.375rem 0.75rem;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-muted);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-btn:hover { color: var(--color-text); }
    .filter-btn.active {
      background: var(--color-surface);
      color: var(--color-text);
      box-shadow: var(--shadow-sm);
    }
    .bg-surface-2 { background: var(--color-surface-2); }
    .bg-surface { background: var(--color-surface); }
    .border-border { border-color: var(--color-border); }
  `]
})
export class ReportFiltersComponent {
  selected = signal<ReportPeriod>('7d');
  periodChanged = output<ReportPeriod>();

  select(period: ReportPeriod): void {
    this.selected.set(period);
    this.periodChanged.emit(period);
  }
}
