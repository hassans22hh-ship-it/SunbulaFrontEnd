import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';

export type ReportPeriod = '7d' | '30d' | '90d';

@Component({
  selector: 'sb-report-filters',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './report-filters.component.html',
  styleUrl: './report-filters.component.scss'
})
export class ReportFiltersComponent {
  selected = signal<ReportPeriod>('7d');
  periodChanged = output<ReportPeriod>();

  select(period: ReportPeriod): void {
    this.selected.set(period);
    this.periodChanged.emit(period);
  }
}
