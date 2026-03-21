import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';

@Component({
  selector: 'sb-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <ng-content />
    </div>
  `,
  styles: [`:host { display: contents; }`],
})
export class SbCardComponent {}
