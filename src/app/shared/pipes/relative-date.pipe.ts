import { Pipe, PipeTransform } from '@angular/core';
import {
  formatDistanceToNow,
  parseISO,
  isValid,
} from 'date-fns';

/**
 * Converts an ISO date string to a relative time: "2 hours ago", "3 days ago"
 */
@Pipe({ name: 'relativeDate', standalone: true })
export class RelativeDatePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '—';
    try {
      const date = parseISO(value);
      if (!isValid(date)) return '—';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return '—';
    }
  }
}
