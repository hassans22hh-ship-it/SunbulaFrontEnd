import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BehaviorCategory, BEHAVIOR_META } from '@shared/models/enums';

@Component({
  selector: 'sb-behavior-badge',
  standalone: true,
  templateUrl: './sb-behavior-badge.component.html',
  styleUrl: './sb-behavior-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SbBehaviorBadgeComponent {
  readonly behavior = input.required<BehaviorCategory>();

  protected get meta() {
    return BEHAVIOR_META[this.behavior()];
  }
}
