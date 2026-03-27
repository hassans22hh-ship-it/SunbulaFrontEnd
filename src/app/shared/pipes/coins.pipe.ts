import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'coins', standalone: true })
export class CoinsPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) return '0';
    return new Intl.NumberFormat('en-US').format(value);
  }
}
