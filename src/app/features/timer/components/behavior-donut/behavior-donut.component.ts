import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sb-behavior-donut',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="donut-container">
      <div class="donut-header">
        <h3 class="donut-title">📊 Behavior Breakdown</h3>
        <span class="donut-subtitle">{{ totalTimeLabel() }} total</span>
      </div>

      <div class="donut-body">
        @if (totalSeconds() === 0) {
          <div class="empty-state">
            <span class="empty-icon">⏳</span>
            <p>No trackable data yet</p>
          </div>
        } @else {
          <div class="chart-wrapper">
            <svg viewBox="0 0 100 100" class="donut-svg">
              @for (segment of segments(); track segment.color) {
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  [attr.stroke]="segment.color" 
                  stroke-width="14"
                  [attr.stroke-dasharray]="segment.dasharray"
                  [attr.stroke-dashoffset]="segment.dashoffset"
                  class="donut-segment"
                  [title]="segment.label + ': ' + (segment.percentage * 100 | number:'1.0-0') + '%'"
                />
              }
            </svg>
            <div class="donut-center">
              <span class="center-score" [style.color]="primaryColor()">{{ primaryPercentage() | number:'1.0-0' }}%</span>
              <span class="center-label">Positive</span>
            </div>
          </div>
          
          <div class="legend">
            @for (segment of segments(); track segment.color) {
              @if (segment.value > 0) {
                <div class="legend-item">
                  <span class="legend-color" [style.background]="segment.color"></span>
                  <div class="legend-text">
                    <span class="legend-label">{{ segment.label }}</span>
                    <span class="legend-value">{{ segment.percentage * 100 | number:'1.0-0' }}%</span>
                  </div>
                </div>
              }
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .donut-container {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: 1.5rem;
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-sm);
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .donut-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      .donut-title {
        font-weight: 700;
        font-size: 1.1rem;
        margin: 0;
        color: var(--color-text);
      }

      .donut-subtitle {
        font-size: 0.85rem;
        color: var(--color-text-muted);
        font-weight: 500;
      }
    }

    .donut-body {
      display: flex;
      align-items: center;
      gap: 2rem;
      flex: 1;
    }

    .empty-state {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--color-text-muted);
      
      .empty-icon { font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5; }
      p { font-size: 0.9rem; font-weight: 500; margin: 0; }
    }

    .chart-wrapper {
      position: relative;
      width: 120px;
      height: 120px;
      flex-shrink: 0;
    }

    .donut-svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .donut-segment {
      transition: stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease;
      cursor: pointer;
      &:hover { opacity: 0.8; }
    }

    .donut-center {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      
      .center-score {
        font-weight: 800;
        font-size: 1.25rem;
        line-height: 1;
      }
      
      .center-label {
        font-size: 0.7rem;
        font-weight: 600;
        color: var(--color-text-muted);
        text-transform: uppercase;
        margin-top: 2px;
      }
    }

    .legend {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      flex: 1;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 4px;
    }

    .legend-text {
      display: flex;
      justify-content: space-between;
      flex: 1;
      font-size: 0.85rem;
      font-weight: 600;
      
      .legend-label { color: var(--color-text); }
      .legend-value { color: var(--color-text-muted); }
    }
  `]
})
export class SbBehaviorDonutComponent {
  breakdown = input<any[]>([]); // BehaviorBreakdownItem[]

  totalSeconds = computed(() => {
    return this.breakdown().reduce((acc, curr) => acc + (curr.totalSeconds || 0), 0);
  });

  totalTimeLabel = computed(() => {
    const s = this.totalSeconds();
    if (s === 0) return '0 hrs';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  });

  segments = computed(() => {
    const list = this.breakdown();
    const total = this.totalSeconds();
    if (total === 0) return [];

    let currentOffset = 0;
    const circumference = 2 * Math.PI * 40; // r=40

    // Map behavior types to display properties
    const typeMap: Record<number, { color: string, label: string }> = {
      0: { color: '#52B788', label: 'Positive' }, // var(--color-success)
      1: { color: '#3B82F6', label: 'Neutral' },  // var(--color-info)
      2: { color: '#EF4444', label: 'Negative' }, // var(--color-danger)
      3: { color: '#F59E0B', label: 'Rest' }      // var(--color-warning)
    };

    // Sort by type order
    const sorted = [...list].sort((a, b) => a.behaviorType - b.behaviorType);

    return sorted.map(item => {
      const percentage = (item.totalSeconds || 0) / total;
      const display = typeMap[item.behaviorType] || { color: '#9CA3AF', label: 'Unknown' };
      
      const strokeDashoffset = -currentOffset;
      const strokeDasharray = `${percentage * circumference} ${circumference}`;
      
      currentOffset += percentage * circumference;

      return {
        ...display,
        value: item.totalSeconds,
        percentage,
        dasharray: strokeDasharray,
        dashoffset: strokeDashoffset
      };
    });
  });

  primaryPercentage = computed(() => {
    const segs = this.segments();
    const pos = segs.find(s => s.label === 'Positive');
    return pos ? pos.percentage * 100 : 0;
  });

  primaryColor = computed(() => {
    const segs = this.segments();
    const pos = segs.find(s => s.label === 'Positive');
    return pos ? pos.color : '#9CA3AF';
  });
}
