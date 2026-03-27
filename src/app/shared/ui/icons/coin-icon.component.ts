import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'sb-icon-coin',
  standalone: true,
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#FACC15" stroke="#EAB308" stroke-width="2"/>
      <circle cx="12" cy="12" r="7" stroke="#CA8A04" stroke-width="1" stroke-dasharray="2 2"/>
      <path d="M12 7V17M12 7L9 10M12 7L15 10" stroke="#854D0E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
  styles: [`
    :host { display: inline-flex; align-items: center; justify-content: center; vertical-align: middle; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SbIconCoinComponent {
  readonly size = input<string | number>(20);
}
