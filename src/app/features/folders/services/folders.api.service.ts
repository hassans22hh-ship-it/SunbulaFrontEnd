import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { FolderDto, CreateFolderDto, UpdateFolderDto, TaskDto } from '@shared/models/task.models';

@Injectable({ providedIn: 'root' })
export class FoldersApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/api/v1/Folders`;

  getAll(): Observable<FolderDto[]> { return this.http.get<FolderDto[]>(this.BASE); }
  getById(id: string): Observable<FolderDto> { return this.http.get<FolderDto>(`${this.BASE}/${id}`); }
  getTasksInFolder(id: string): Observable<TaskDto[]> { return this.http.get<TaskDto[]>(`${this.BASE}/${id}/tasks`); }
  create(dto: CreateFolderDto): Observable<FolderDto> { return this.http.post<FolderDto>(this.BASE, dto); }
  update(id: string, dto: UpdateFolderDto): Observable<FolderDto> { return this.http.put<FolderDto>(`${this.BASE}/${id}`, dto); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.BASE}/${id}`); }
}
