import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNow, differenceInSeconds } from 'date-fns';

@Pipe({ name: 'relativeDate', standalone: true })
export class RelativeDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '';

    let date: Date;
    if (typeof value === 'string') {
      const str = value.endsWith('Z') ? value : value + 'Z';
      date = new Date(str);
    } else {
      date = value;
    }

    const diff = differenceInSeconds(new Date(), date);
    if (Math.abs(diff) < 60) {
      return 'Just now';
    }

    return formatDistanceToNow(date, { addSuffix: true });
  }
}
