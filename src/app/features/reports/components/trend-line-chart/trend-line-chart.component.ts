import { ChangeDetectionStrategy, Component, input, OnChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { DailyTrendDto } from '@shared/models/reports.models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'sb-trend-line-chart',
  standalone: true,
  imports: [BaseChartDirective],
  providers: [DatePipe],
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
          [type]="lineChartType">
        </canvas>
      }
    </div>
  `,
  styles: [`
    .text-subtle { color: var(--color-text-muted); }
  `]
})
export class TrendLineChartComponent implements OnChanges {
  data = input<DailyTrendDto[]>([]);

  public lineChartType: ChartType = 'line';

  public chartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Focus Hours', font: { size: 10 } },
        grid: { color: '#e2e8f0' }, border: { display: false }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Tasks Done', font: { size: 10 } },
        grid: { drawOnChartArea: false }, // only want the grid lines for one axis to show up
        border: { display: false }
      },
      x: { grid: { display: false }, border: { display: false } }
    },
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 6, font: { family: 'Inter', size: 12 } } },
      tooltip: {
         usePointStyle: true,
      }
    }
  };

  constructor(private datePipe: DatePipe) {}

  ngOnChanges(): void {
    const d = this.data();
    if (d && d.length > 0) {
      this.chartData = {
        labels: d.map(x => this.datePipe.transform(x.date, 'MMM d')),
        datasets: [
          {
            data: d.map(x => x.totalSeconds / 3600), // Convert to hours
            label: 'Focus Hours',
            backgroundColor: 'rgba(59, 130, 246, 0.1)', // primary with opacity
            borderColor: '#3B82F6',
            pointBackgroundColor: '#3B82F6',
            borderWidth: 2,
            fill: true,
            yAxisID: 'y',
            tension: 0.3 // Smooth curves
          },
          {
            data: d.map(x => x.coinsEarned),
            label: 'Coins Earned',
            backgroundColor: 'rgba(16, 185, 129, 0)',
            borderColor: '#10B981', // success
            pointBackgroundColor: '#10B981',
            borderWidth: 2,
            borderDash: [5, 5],
            yAxisID: 'y1',
            tension: 0.3
          }
        ]
      };
    }
  }
}
