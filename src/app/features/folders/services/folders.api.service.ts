import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { CreateFolderDto, FolderDto, UpdateFolderDto } from '../models/folder.models';

@Injectable({ providedIn: 'root' })
export class FoldersApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/v1/Folders`;

  getAll(): Observable<FolderDto[]> {
    return this.http.get<FolderDto[]>(this.base);
  }

  getById(id: string): Observable<FolderDto> {
    return this.http.get<FolderDto>(`${this.base}/${id}`);
  }

  create(dto: CreateFolderDto): Observable<FolderDto> {
    return this.http.post<FolderDto>(this.base, dto);
  }

  update(id: string, dto: UpdateFolderDto): Observable<FolderDto> {
    return this.http.put<FolderDto>(`${this.base}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
