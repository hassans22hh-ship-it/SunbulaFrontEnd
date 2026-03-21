import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

export type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'info' | 'accent';

@Component({
  selector: 'sb-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="badgeClass()">
      <ng-content />
    </span>
  `,
  styles: [`
    :host { display: contents; }
  `],
})
export class SbBadgeComponent {
  variant = input<BadgeVariant>('default');
  dot     = input<boolean>(false);

  protected badgeClass(): string {
    const base = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold';

    const variantMap: Record<BadgeVariant, string> = {
      default: 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)]',
      success: 'bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)]',
      danger:  'bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] text-[var(--color-danger)]',
      warning: 'bg-[color-mix(in_srgb,var(--color-warning)_20%,transparent)] text-[#B5870A]',
      info:    'bg-[color-mix(in_srgb,var(--color-info)_15%,transparent)] text-[var(--color-info)]',
      accent:  'bg-[color-mix(in_srgb,var(--color-accent)_15%,transparent)] text-[var(--color-accent-dark)]',
    };

    return `${base} ${variantMap[this.variant()]}`;
  }
}
