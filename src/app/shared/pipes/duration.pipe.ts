import { Pipe, PipeTransform } from '@angular/core';

/**
 * Converts seconds to a human-readable duration string.
 * < 1 hour: "mm:ss"
 * >= 1 hour: "hh:mm:ss"
 * With words: "2h 30m"
 */
@Pipe({ name: 'duration', standalone: true })
export class DurationPipe implements PipeTransform {
  transform(seconds: number, format: 'clock' | 'words' = 'clock'): string {
    if (!seconds || seconds < 0) seconds = 0;

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (format === 'words') {
      if (h > 0) return `${h}h ${m}m`;
      if (m > 0) return `${m}m ${s}s`;
      return `${s}s`;
    }

    // clock format
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');

    if (h > 0) {
      const hh = String(h).padStart(2, '0');
      return `${hh}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
  }
}
