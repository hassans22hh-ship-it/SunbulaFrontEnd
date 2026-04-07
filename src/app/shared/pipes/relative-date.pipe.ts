import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNow, parseISO } from 'date-fns';

@Pipe({ name: 'relativeDate', standalone: true })
export class RelativeDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '';

    let date: Date;
    if (typeof value === 'string') {
      let str = value;
      // Removed forced 'Z' to fix local time drift
      date = parseISO(str);
    } else {
      date = value;
    }

    return formatDistanceToNow(date, { addSuffix: true });
  }
}
