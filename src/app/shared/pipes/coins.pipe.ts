import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats a coin number: 1500 → "1,500 🪙"
 */
@Pipe({ name: 'coins', standalone: true })
export class CoinsPipe implements PipeTransform {
  transform(value: number, showEmoji = true): string {
    const formatted = new Intl.NumberFormat('en-US').format(Math.round(value));
    return showEmoji ? `${formatted} 🪙` : formatted;
  }
}
