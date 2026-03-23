import { Pipe, PipeTransform } from '@angular/core';

export type DurationFormat = 'clock' | 'words' | 'short';

@Pipe({
  name: 'duration',
  standalone: true,
  pure: true,
})
export class DurationPipe implements PipeTransform {
  transform(seconds: number | null | undefined, format: DurationFormat = 'clock'): string {
    if (seconds === null || seconds === undefined || isNaN(seconds) || seconds < 0) {
      return format === 'clock' ? '00:00' : '0m';
    }

    const totalSeconds = Math.floor(seconds);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    switch (format) {
      case 'clock':
        return h > 0
          ? `${h}:${pad(m)}:${pad(s)}`
          : `${pad(m)}:${pad(s)}`;

      case 'words':
        if (h > 0 && m > 0) return `${h}h ${m}m`;
        if (h > 0)           return `${h}h`;
        if (m > 0 && s > 0)  return `${m}m ${s}s`;
        if (m > 0)           return `${m}m`;
        return `${s}s`;

      case 'short':
        if (h > 0) return `${h}h ${pad(m)}m`;
        if (m > 0) return `${m}m`;
        return `${s}s`;

      default:
        return `${pad(m)}:${pad(s)}`;
    }
  }
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}
