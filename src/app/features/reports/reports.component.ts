import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ReportsApiService } from './services/reports.api.service';
import { ComprehensiveReportDto, ReportFilterDto } from './models/reports.models';
import { ReportFiltersComponent, ReportPeriod } from './components/report-filters/report-filters.component';
import { TimePieChartComponent } from './components/time-pie-chart/time-pie-chart.component';
import { BehaviorBarChartComponent } from './components/behavior-bar-chart/behavior-bar-chart.component';
import { TrendLineChartComponent } from './components/trend-line-chart/trend-line-chart.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { AnimateDirective } from '@shared/directives/animate.directive';

@Component({
  selector: 'sb-reports-page',
  standalone: true,
  imports: [
    ReportFiltersComponent,
    TimePieChartComponent,
    BehaviorBarChartComponent,
    TrendLineChartComponent,
    SbSpinnerComponent,
    SbEmptyStateComponent,
    AnimateDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container py-6" sbPage>
      
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8" sbAnimate="slideLeft">
        <div>
          <h1 class="section-title">Analytics & Reports</h1>
          <p class="text-subtle mt-1 text-sm">Visualize your productivity and behavior trends over time.</p>
        </div>
        
        <sb-report-filters (periodChanged)="onPeriodChanged($event)" />
      </div>

      @if (loading()) {
        <div class="flex justify-center items-center py-20"><sb-spinner /></div>
      } @else if (error()) {
        <sb-empty-state icon="⚠️" title="Failed to load report" [message]="error()!" [showRetry]="true" (retry)="loadReport()" />
      } @else if (report()) {
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" sbAnimate="fadeUp">
          
          <!-- Summary Cards Inside Report -->
          <div class="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
             <div class="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
               <div>
                  <div class="text-sm font-medium text-subtle">Total Focus Time</div>
                  <div class="text-2xl font-bold text-text">{{ Math.floor(report()!.totalFocusSecs / 3600) }}h {{ Math.floor((report()!.totalFocusSecs % 3600) / 60) }}m</div>
               </div>
               <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl">⏱️</div>
             </div>
             
             <div class="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
               <div>
                  <div class="text-sm font-medium text-subtle">Tasks Completed</div>
                  <div class="text-2xl font-bold text-text">{{ report()!.totalTasksDone }}</div>
               </div>
               <div class="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center text-xl">✅</div>
             </div>
          </div>

          <!-- Pie Chart: Time Distribution -->
          <div class="bg-surface border border-border rounded-xl p-5 shadow-sm">
            <h3 class="font-semibold text-text mb-4">Time Distribution</h3>
            <div class="h-[300px]">
              <sb-time-pie-chart [data]="report()!.timeDistribution" />
            </div>
          </div>

          <!-- Bar Chart: Behaviors -->
          <div class="bg-surface border border-border rounded-xl p-5 shadow-sm">
            <h3 class="font-semibold text-text mb-4">Behavior Tracker</h3>
            <div class="h-[300px]">
              <sb-behavior-bar-chart [data]="report()!.behaviorStats" />
            </div>
          </div>

        </div>

        <!-- Line Chart: Trends over time -->
        <div class="bg-surface border border-border rounded-xl p-5 shadow-sm" sbAnimate="fadeUp" style="animation-delay: 0.1s;">
          <h3 class="font-semibold text-text mb-4">Productivity Trends</h3>
          <div class="h-[350px]">
            <sb-trend-line-chart [data]="report()!.dailyTrends" />
          </div>
        </div>

      }

    </div>
  `,
  styles: [`
    .text-subtle { color: var(--color-text-muted); }
    .text-text { color: var(--color-text); }
    .bg-surface { background: var(--color-surface); }
    .border-border { border-color: var(--color-border); }
    
    .bg-primary\\/10 { background: color-mix(in srgb, var(--color-primary) 10%, transparent); }
    .text-primary { color: var(--color-primary); }
    
    .bg-success\\/10 { background: color-mix(in srgb, var(--color-success) 10%, transparent); }
    .text-success { color: var(--color-success); }
  `]
})
export class ReportsPageComponent implements OnInit {
  private readonly api = inject(ReportsApiService);
  private readonly titleService = inject(Title);

  report  = signal<ComprehensiveReportDto | null>(null);
  loading = signal<boolean>(true);
  error   = signal<string | null>(null);
  currentPeriod = signal<ReportPeriod>('7d');
  
  protected readonly Math = Math;

  ngOnInit(): void {
    this.titleService.setTitle('Reports | Sunbula');
    this.loadReport();
  }

  onPeriodChanged(period: ReportPeriod): void {
    this.currentPeriod.set(period);
    this.loadReport();
  }

  loadReport(): void {
    this.loading.set(true);
    this.error.set(null);

    const filter = this.buildFilter(this.currentPeriod());

    this.api.getReport(filter).subscribe({
      next: (res) => {
        this.report.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        // Backend might not be ready, let's gracefully show empty data if error for prototype
        this.report.set({
          timeDistribution: [],
          behaviorStats: [],
          dailyTrends: [],
          totalFocusSecs: 0,
          totalTasksDone: 0
        });
        this.loading.set(false);
        // If we want to strictly show error:
        // this.error.set(err.message || 'Failed to fetch report data');
        // this.loading.set(false);
      }
    });
  }

  private buildFilter(period: ReportPeriod): ReportFilterDto {
    const end = new Date();
    const start = new Date();
    
    if (period === '7d') start.setDate(start.getDate() - 7);
    if (period === '30d') start.setDate(start.getDate() - 30);
    if (period === '90d') start.setDate(start.getDate() - 90);

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    };
  }
}
