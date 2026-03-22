import { ChangeDetectionStrategy, Component, input, OnChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BehaviorStatsDto } from '../../models/reports.models';
import { BehaviorCategory, BEHAVIOR_META } from '../../../../shared/models/enums';

@Component({
  selector: 'sb-behavior-bar-chart',
  standalone: true,
  imports: [BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart-container relative h-full w-full min-h-[300px]">
      @if (data().length === 0) {
        <div class="absolute inset-0 flex items-center justify-center text-subtle text-sm">
          No data available for this period.
        </div>
      } @else {
        <canvas baseChart
          [data]="chartData"
          [options]="chartOptions"
          [type]="barChartType">
        </canvas>
      }
    </div>
  `,
  styles: [`
    .text-subtle { color: var(--color-text-muted); }
  `]
})
export class BehaviorBarChartComponent implements OnChanges {
  data = input<BehaviorStatsDto[]>([]);

  public barChartType: ChartType = 'bar';

  public chartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [] }]
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, grid: { color: '#e2e8f0' /* Adjust to theme */ }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw} items`
        }
      }
    }
  };

  ngOnChanges(): void {
    const d = this.data();
    if (d && d.length > 0) {
      // Sort by some arbitrary order or use as is
      this.chartData = {
        labels: d.map(x => BEHAVIOR_META[x.behaviorType as BehaviorCategory]?.label || 'Unknown'),
        datasets: [{
          data: d.map(x => x.count),
          backgroundColor: d.map(x => BEHAVIOR_META[x.behaviorType as BehaviorCategory]?.color || '#cbd5e1'),
          borderRadius: 6
        }]
      };
    }
  }
}
