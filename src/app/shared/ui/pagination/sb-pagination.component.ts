import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

@Component({
  selector: 'sb-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sb-pagination.component.html',
  styleUrl: './sb-pagination.component.scss'
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
