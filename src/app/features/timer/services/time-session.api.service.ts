import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@env/environment';
import { TimeSessionDto, StartSessionDto } from '@shared/models/timer.models';
import { PagedResult } from '@shared/models/enums';

@Injectable({ providedIn: 'root' })
export class TimeSessionApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/api/v1/TimeSession`;

  // Queries
  getAll(params?: any): Observable<TimeSessionDto[]> { return this.http.get<TimeSessionDto[]>(this.BASE, { params }); }
  getPaged(page = 1, pageSize = 20): Observable<PagedResult<TimeSessionDto>> {
    return this.http.get<PagedResult<TimeSessionDto>>(this.BASE, { params: { page, pageSize } });
  }
  getHistory(): Observable<TimeSessionDto[]> { return this.http.get<TimeSessionDto[]>(`${this.BASE}/history`); }
  getById(id: string): Observable<TimeSessionDto> { return this.http.get<TimeSessionDto>(`${this.BASE}/${id}`); }
  getByDate(date: string): Observable<TimeSessionDto[]> { return this.http.get<TimeSessionDto[]>(`${this.BASE}/date`, { params: { date } }); }
  getRange(from: string, to: string): Observable<TimeSessionDto[]> {
    return this.http.get<TimeSessionDto[]>(`${this.BASE}/range`, { params: { from, to } });
  }
  getActive(): Observable<TimeSessionDto | null> {
    return this.http.get<TimeSessionDto>(`${this.BASE}/active`).pipe(
      catchError(err => err.status === 204 ? of(null) : throwError(() => err)),
    );
  }

  // Commands
  start(dto: StartSessionDto): Observable<TimeSessionDto> { return this.http.post<TimeSessionDto>(`${this.BASE}/start`, dto); }
  stop(id: string): Observable<TimeSessionDto> { return this.http.post<TimeSessionDto>(`${this.BASE}/${id}/stop`, null); }
  stopActive(): Observable<TimeSessionDto | null> {
    return this.http.post<TimeSessionDto>(`${this.BASE}/stop-active`, null).pipe(
      catchError(err => err.status === 204 ? of(null) : throwError(() => err)),
    );
  }
  pause(id: string): Observable<TimeSessionDto> { return this.http.post<TimeSessionDto>(`${this.BASE}/${id}/pause`, null); }
  resume(id: string): Observable<TimeSessionDto> { return this.http.post<TimeSessionDto>(`${this.BASE}/${id}/resume`, null); }
  manual(dto: any): Observable<TimeSessionDto> { return this.http.post<TimeSessionDto>(`${this.BASE}/manual`, dto); }
  update(id: string, dto: any): Observable<TimeSessionDto> { return this.http.put<TimeSessionDto>(`${this.BASE}/${id}`, dto); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.BASE}/${id}`); }
  recover(id: string): Observable<TimeSessionDto> { return this.http.post<TimeSessionDto>(`${this.BASE}/${id}/recover`, null); }
}
