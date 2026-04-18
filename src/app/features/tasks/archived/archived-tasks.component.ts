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
  templateUrl: './archived-tasks.component.html',
  styleUrl: './archived-tasks.component.scss'
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
