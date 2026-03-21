import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { BehaviorCategory, BEHAVIOR_META } from '../../models/enums';

@Component({
  selector: 'sb-behavior-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="cssClass()">
      <span>{{ meta().emoji }}</span>
      <span>{{ meta().label }}</span>
    </span>
  `,
})
export class SbBehaviorBadgeComponent {
  behavior = input.required<BehaviorCategory>();

  protected meta() {
    return BEHAVIOR_META[this.behavior()];
  }

  protected cssClass(): string {
    const map: Record<BehaviorCategory, string> = {
      [BehaviorCategory.Positive]: 'behavior-positive',
      [BehaviorCategory.Neutral]:  'behavior-neutral',
      [BehaviorCategory.Negative]: 'behavior-negative',
      [BehaviorCategory.Rest]:     'behavior-rest',
    };
    return `inline-flex items-center gap-1 ${map[this.behavior()]}`;
  }
}
