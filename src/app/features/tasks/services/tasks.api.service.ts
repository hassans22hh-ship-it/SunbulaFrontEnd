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

  getAll(params?: TaskQueryParams): Observable<TaskDto[]> {
    return this.http.get<TaskDto[]>(this.BASE, {
      params: params ? buildHttpParams(params as Record<string, string | number | boolean | null | undefined>) : undefined,
    });
  }
  getById(id: string): Observable<TaskDto> { return this.http.get<TaskDto>(`${this.BASE}/${id}`); }
  create(dto: CreateTaskDto): Observable<TaskDto> { return this.http.post<TaskDto>(this.BASE, dto); }
  update(id: string, dto: UpdateTaskDto): Observable<TaskDto> { return this.http.put<TaskDto>(`${this.BASE}/${id}`, dto); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.BASE}/${id}`); }
  complete(id: string): Observable<TaskDto> { return this.http.put<TaskDto>(`${this.BASE}/${id}/complete`, null); }
  archive(id: string): Observable<TaskDto> { return this.http.put<TaskDto>(`${this.BASE}/${id}/archive`, null); }
  restore(id: string): Observable<TaskDto> { return this.http.put<TaskDto>(`${this.BASE}/${id}/restore`, null); }
}
