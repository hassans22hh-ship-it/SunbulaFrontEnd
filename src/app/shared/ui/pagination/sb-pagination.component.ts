import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

@Component({
  selector: 'sb-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (totalPages() > 1) {
      <div class="flex items-center justify-between px-2 py-6">
        <span class="text-sm text-text-muted font-medium">
          Page {{ currentPage() }} of {{ totalPages() }}
          @if (totalCount()) {
            <span class="ml-2 text-text-subtle">({{ totalCount() }} total)</span>
          }
        </span>
        <div class="flex items-center gap-2">
          <button
            [disabled]="!hasPreviousPage()"
            (click)="pageChange.emit(currentPage() - 1)"
            class="px-4 py-2 rounded-xl text-sm font-bold transition-all
                   bg-surface-2 text-text-muted hover:bg-surface-3
                   disabled:opacity-40 disabled:cursor-not-allowed">
            ← Previous
          </button>

          @for (page of visiblePages(); track page) {
            <button
              (click)="pageChange.emit(page)"
              [class.bg-primary]="page === currentPage()"
              [class.text-white]="page === currentPage()"
              [class.bg-surface-2]="page !== currentPage()"
              [class.text-text-muted]="page !== currentPage()"
              class="w-10 h-10 rounded-xl text-sm font-bold transition-all hover:scale-105">
              {{ page }}
            </button>
          }

          <button
            [disabled]="!hasNextPage()"
            (click)="pageChange.emit(currentPage() + 1)"
            class="px-4 py-2 rounded-xl text-sm font-bold transition-all
                   bg-surface-2 text-text-muted hover:bg-surface-3
                   disabled:opacity-40 disabled:cursor-not-allowed">
            Next →
          </button>
        </div>
      </div>
    }
  `,
})
export class SbPaginationComponent {
  currentPage     = input.required<number>();
  totalPages      = input.required<number>();
  totalCount      = input<number>(0);
  hasNextPage     = input<boolean>(false);
  hasPreviousPage = input<boolean>(false);

  pageChange = output<number>();

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });
}
