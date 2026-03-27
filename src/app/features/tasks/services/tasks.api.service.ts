import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { TaskDto, CreateTaskDto, UpdateTaskDto, TaskQueryParams } from '@shared/models/task.models';
import { buildHttpParams } from '@shared/utils/http-params.util';

@Injectable({ providedIn: 'root' })
export class TasksApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/api/v1/Tasks`;

  // Queries
  getAll(params?: TaskQueryParams): Observable<TaskDto[]> {
    return this.http.get<TaskDto[]>(this.BASE, {
      params: params ? buildHttpParams(params as Record<string, string | number | boolean | null | undefined>) : undefined,
    });
  }
  getActive(): Observable<TaskDto[]> { return this.http.get<TaskDto[]>(`${this.BASE}/active`); }
  getArchived(): Observable<TaskDto[]> { return this.http.get<TaskDto[]>(`${this.BASE}/archived`); }
  getById(id: string): Observable<TaskDto> { return this.http.get<TaskDto>(`${this.BASE}/${id}`); }
  getDetails(id: string): Observable<TaskDto> { return this.http.get<TaskDto>(`${this.BASE}/${id}/details`); }
  getByFolder(folderId: string): Observable<TaskDto[]> { return this.http.get<TaskDto[]>(`${this.BASE}/folder/${folderId}`); }
  getByCategory(categoryId: string): Observable<TaskDto[]> { return this.http.get<TaskDto[]>(`${this.BASE}/category/${categoryId}`); }
  getByBehavior(type: string): Observable<TaskDto[]> { return this.http.get<TaskDto[]>(`${this.BASE}/behavior/${type}`); }
  search(query: string): Observable<TaskDto[]> { return this.http.get<TaskDto[]>(`${this.BASE}/search`, { params: { query } }); }
  getRecent(): Observable<TaskDto[]> { return this.http.get<TaskDto[]>(`${this.BASE}/recent`); }

  // Commands
  create(dto: CreateTaskDto): Observable<TaskDto> { return this.http.post<TaskDto>(this.BASE, dto); }
  duplicate(id: string): Observable<TaskDto> { return this.http.post<TaskDto>(`${this.BASE}/${id}/duplicate`, null); }
  update(id: string, dto: UpdateTaskDto): Observable<TaskDto> { return this.http.put<TaskDto>(`${this.BASE}/${id}`, dto); }
  
  // PATCH per Doc 1.2
  archive(id: string): Observable<TaskDto> { return this.http.patch<TaskDto>(`${this.BASE}/${id}/archive`, null); }
  unarchive(id: string): Observable<TaskDto> { return this.http.patch<TaskDto>(`${this.BASE}/${id}/unarchive`, null); }
  complete(id: string): Observable<TaskDto> { return this.http.patch<TaskDto>(`${this.BASE}/${id}/complete`, null); }
  
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.BASE}/${id}`); }

  // Category Links
  linkCategory(taskId: string, categoryId: string): Observable<void> { 
    return this.http.post<void>(`${this.BASE}/${taskId}/categories/${categoryId}`, {}); 
  }
  unlinkCategory(taskId: string, categoryId: string): Observable<void> { 
    return this.http.delete<void>(`${this.BASE}/${taskId}/categories/${categoryId}`); 
  }
}
