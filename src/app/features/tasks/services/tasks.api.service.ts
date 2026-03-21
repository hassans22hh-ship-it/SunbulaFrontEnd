import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { TaskDto, CreateTaskDto, UpdateTaskDto, TaskQueryParams } from '../models/task.models';
import { toHttpParams } from '@shared/utils/http-params.util';

@Injectable({ providedIn: 'root' })
export class TasksApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/v1/Tasks`;

  getAll(queryParams?: TaskQueryParams): Observable<TaskDto[]> {
    const params = toHttpParams(queryParams);
    return this.http.get<TaskDto[]>(this.base, { params });
  }

  getById(id: string): Observable<TaskDto> {
    return this.http.get<TaskDto>(`${this.base}/${id}`);
  }

  create(dto: CreateTaskDto): Observable<TaskDto> {
    return this.http.post<TaskDto>(this.base, dto);
  }

  update(id: string, dto: UpdateTaskDto): Observable<TaskDto> {
    return this.http.put<TaskDto>(`${this.base}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  changeStatus(id: string, newStatus: number): Observable<TaskDto> {
    return this.http.patch<TaskDto>(`${this.base}/${id}/status`, newStatus, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
