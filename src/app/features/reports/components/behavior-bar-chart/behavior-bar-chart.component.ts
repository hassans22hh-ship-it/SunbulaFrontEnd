import { ChangeDetectionStrategy, Component, input, OnChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BehaviorStatsDto } from '@shared/models/reports.models';
import { BehaviorCategory, BEHAVIOR_META } from '../../../../shared/models/enums';

@Component({
  selector: 'sb-behavior-bar-chart',
  standalone: true,
  imports: [BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './behavior-bar-chart.component.html',
  styleUrl: './behavior-bar-chart.component.scss'
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
      y: { beginAtZero: true, grid: { color: '#e2e8f0' }, border: { display: false } },
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
      this.chartData = {
        labels: d.map(x => BEHAVIOR_META[x.behaviorType as BehaviorCategory]?.label || 'Unknown'),
        datasets: [{
          data: d.map(x => x.sessionCount),
          backgroundColor: d.map(x => `var(${BEHAVIOR_META[x.behaviorType as BehaviorCategory]?.colorVar || '--color-surface-3'})`),
          borderRadius: 6
        }]
      };
    }
  }
}
