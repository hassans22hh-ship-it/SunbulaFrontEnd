import { ChangeDetectionStrategy, Component, input, OnChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { TimeDistributionDto } from '../../models/reports.models';

@Component({
  selector: 'sb-time-pie-chart',
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
          [type]="pieChartType">
        </canvas>
      }
    </div>
  `,
  styles: [`
    .text-subtle { color: var(--color-text-muted); }
  `]
})
export class TimePieChartComponent implements OnChanges {
  data = input<TimeDistributionDto[]>([]);

  public pieChartType: ChartType = 'doughnut';
  
  public chartData: ChartData<'doughnut', number[], string | string[]> = {
    labels: [],
    datasets: [{ data: [] }]
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#64748b', // Adjust to theme
          font: { family: 'Inter', size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw as number;
            const hours = Math.floor(val / 3600);
            const mins = Math.floor((val % 3600) / 60);
            if (hours > 0) return ` ${hours}h ${mins}m`;
            return ` ${mins}m`;
          }
        }
      }
    }
  };

  ngOnChanges(): void {
    const d = this.data();
    if (d && d.length > 0) {
      this.chartData = {
        labels: d.map(x => x.label),
        datasets: [{
          data: d.map(x => x.durationSecs),
          backgroundColor: [
            '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'
          ],
          borderWidth: 0,
          hoverOffset: 4
        }]
      };
    }
  }
}
