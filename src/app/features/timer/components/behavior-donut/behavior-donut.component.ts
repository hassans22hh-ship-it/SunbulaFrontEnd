import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sb-behavior-donut',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './behavior-donut.component.html',
  styleUrl: './behavior-donut.component.scss'
})
export class SbBehaviorDonutComponent {
  breakdown = input<any[]>([]);
  title = input<string>('Behavior Breakdown');

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
    const circumference = 2 * Math.PI * 40;

    const typeMap: Record<number, { color: string, label: string }> = {
      1: { color: '#52B788', label: 'Positive' },
      2: { color: '#3B82F6', label: 'Neutral' },
      3: { color: '#F59E0B', label: 'Rest' },
      4: { color: '#EF4444', label: 'Negative' }
    };

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

}
