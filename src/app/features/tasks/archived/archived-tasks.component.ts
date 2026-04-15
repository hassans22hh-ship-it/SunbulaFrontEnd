import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TasksStore } from '../store/tasks.store';
import { TaskCardComponent } from '../components/task-card/task-card.component';
import { SbPaginationComponent } from '@shared/ui/pagination/sb-pagination.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';

@Component({
  selector: 'sb-archived-tasks',
  standalone: true,
  imports: [
    TaskCardComponent, SbPaginationComponent,
    SbSpinnerComponent, SbEmptyStateComponent,
    PageTransitionDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-bg flex flex-col shadow-2xl rounded-3xl overflow-hidden mr-4 my-4 ml-0 border border-border/30" sbPageTransition>
      <main class="flex-1 flex flex-col bg-surface">
        <!-- Header -->
        <header class="p-6 border-b border-border/30 flex items-center justify-between bg-surface/50 backdrop-blur-xl sticky top-0 z-20">
          <div class="flex items-center gap-4">
            <button (click)="goBack()"
              class="flex items-center justify-center w-10 h-10 rounded-xl bg-surface-2 text-text-muted hover:text-primary hover:bg-primary/10 transition-all">
              <svg viewBox="0 0 24 24" fill="none" class="w-5 h-5" stroke="currentColor" stroke-width="2.5">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <div>
              <h1 class="text-2xl font-display font-bold text-text tracking-tight">📦 Archived Tasks</h1>
              <p class="text-xs text-text-muted mt-0.5">Tasks you've archived. Restore them anytime.</p>
            </div>
          </div>
          @if (store.archivedTotalCount() > 0) {
            <span class="text-sm font-bold text-text-subtle bg-surface-2 px-4 py-1.5 rounded-full">
              {{ store.archivedTotalCount() }} total
            </span>
          }
        </header>

        <!-- Content -->
        <div class="flex-1 p-10 overflow-auto">
          @if (store.archivedLoading()) {
            <div class="flex h-64 items-center justify-center">
              <sb-spinner size="lg" />
            </div>
          } @else if (store.archivedItems().length === 0) {
            <sb-empty-state
              icon="📦"
              heading="No archived tasks"
              message="Tasks you archive will appear here. You can restore them at any time."
              class="mt-20" />
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-8">
              @for (task of store.archivedItems(); track task.id) {
                <sb-task-card
                  [task]="task"
                  (cardClicked)="viewTask($event.id)"
                  (menuClicked)="onRestore(task.id)" />
              }
            </div>

            <sb-pagination
              [currentPage]="store.archivedPageNumber()"
              [totalPages]="store.archivedTotalPages()"
              [totalCount]="store.archivedTotalCount()"
              [hasNextPage]="store.archivedHasNext()"
              [hasPreviousPage]="store.archivedHasPrevious()"
              (pageChange)="onPageChange($event)" />
          }
        </div>
      </main>
    </div>
  `,
})
export class ArchivedTasksComponent implements OnInit {
  protected readonly store = inject(TasksStore);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.store.loadArchived(1, 10);
  }

  onPageChange(page: number): void {
    this.store.loadArchived(page, this.store.archivedPageSize());
  }

  onRestore(id: string): void {
    this.store.restore(id);
  }

  viewTask(id: string): void {
    this.router.navigate(['/tasks', id]);
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }
}
