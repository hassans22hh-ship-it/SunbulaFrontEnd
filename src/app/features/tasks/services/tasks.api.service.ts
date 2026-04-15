import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { TaskDto, CreateTaskDto, UpdateTaskDto, TaskQueryParams, PaginatedResult, PaginationParams } from '@shared/models/task.models';
import { buildHttpParams } from '@shared/utils/http-params.util';

@Injectable({ providedIn: 'root' })
export class TasksApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/api/v1/Tasks`;

  // ─── Queries (Paginated) ──────────────────────────────

  getAll(params?: TaskQueryParams): Observable<PaginatedResult<TaskDto>> {
    return this.http.get<PaginatedResult<TaskDto>>(this.BASE, {
      params: params ? buildHttpParams(params as Record<string, string | number | boolean | null | undefined>) : undefined,
    });
  }

  getActive(): Observable<TaskDto[]> { return this.http.get<TaskDto[]>(`${this.BASE}/active`); }

  /** GET /api/v1/Tasks/archived?PageNumber=&PageSize= */
  getArchived(params?: PaginationParams): Observable<PaginatedResult<TaskDto>> {
    return this.http.get<PaginatedResult<TaskDto>>(`${this.BASE}/archived`, {
      params: params ? buildHttpParams(params as Record<string, string | number | boolean | null | undefined>) : undefined,
    });
  }

  getById(id: string): Observable<TaskDto> { return this.http.get<TaskDto>(`${this.BASE}/${id}`); }

  getDetails(id: string): Observable<TaskDto> { return this.http.get<TaskDto>(`${this.BASE}/${id}/details`); }

  /** GET /api/v1/Tasks/folder/{folderId}?PageNumber=&PageSize= */
  getByFolder(folderId: string, params?: PaginationParams): Observable<PaginatedResult<TaskDto>> {
    return this.http.get<PaginatedResult<TaskDto>>(`${this.BASE}/folder/${folderId}`, {
      params: params ? buildHttpParams(params as Record<string, string | number | boolean | null | undefined>) : undefined,
    });
  }

  /** GET /api/v1/Tasks/category/{categoryId}?PageNumber=&PageSize= */
  getByCategory(categoryId: string, params?: PaginationParams): Observable<PaginatedResult<TaskDto>> {
    return this.http.get<PaginatedResult<TaskDto>>(`${this.BASE}/category/${categoryId}`, {
      params: params ? buildHttpParams(params as Record<string, string | number | boolean | null | undefined>) : undefined,
    });
  }

  /** GET /api/v1/Tasks/behavior/{behaviorType}?PageNumber=&PageSize= */
  getByBehavior(type: number, params?: PaginationParams): Observable<PaginatedResult<TaskDto>> {
    return this.http.get<PaginatedResult<TaskDto>>(`${this.BASE}/behavior/${type}`, {
      params: params ? buildHttpParams(params as Record<string, string | number | boolean | null | undefined>) : undefined,
    });
  }

  /** GET /api/v1/Tasks/search?query=&PageNumber=&PageSize= */
  search(query: string, params?: PaginationParams): Observable<PaginatedResult<TaskDto>> {
    return this.http.get<PaginatedResult<TaskDto>>(`${this.BASE}/search`, {
      params: buildHttpParams({
        query,
        ...(params || {}),
      } as Record<string, string | number | boolean | null | undefined>),
    });
  }

  getRecent(): Observable<TaskDto[]> { return this.http.get<TaskDto[]>(`${this.BASE}/recent`); }

  // ─── Commands ─────────────────────────────────────────

  create(dto: CreateTaskDto): Observable<TaskDto> { return this.http.post<TaskDto>(this.BASE, dto); }
  duplicate(id: string): Observable<TaskDto> { return this.http.post<TaskDto>(`${this.BASE}/${id}/duplicate`, null); }
  update(id: string, dto: UpdateTaskDto): Observable<TaskDto> { return this.http.put<TaskDto>(`${this.BASE}/${id}`, dto); }

  // PATCH endpoints return 204 No Content
  archive(id: string): Observable<void> { return this.http.patch<void>(`${this.BASE}/${id}/archive`, null); }
  unarchive(id: string): Observable<void> { return this.http.patch<void>(`${this.BASE}/${id}/unarchive`, null); }
  complete(id: string): Observable<void> { return this.http.patch<void>(`${this.BASE}/${id}/complete`, null); }

  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.BASE}/${id}`); }

  // ─── Category Links ───────────────────────────────────

  linkCategory(taskId: string, categoryId: string): Observable<void> {
    return this.http.post<void>(`${this.BASE}/${taskId}/categories/${categoryId}`, {});
  }
  unlinkCategory(taskId: string, categoryId: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${taskId}/categories/${categoryId}`);
  }
}
