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

  getAll(): Observable<TimeSessionDto[]> {
    return this.http.get<TimeSessionDto[]>(this.BASE);
  }

  getPaged(page = 1, pageSize = 20): Observable<PagedResult<TimeSessionDto>> {
    return this.http.get<PagedResult<TimeSessionDto>>(`${this.BASE}/paged`, {
      params: { page, pageSize },
    });
  }

  /** Returns null if no active session (204) */
  getActive(): Observable<TimeSessionDto | null> {
    return this.http.get<TimeSessionDto>(`${this.BASE}/active`).pipe(
      catchError(err => err.status === 204 ? of(null) : throwError(() => err)),
    );
  }

  /** 409 if session already running */
  start(dto: StartSessionDto): Observable<TimeSessionDto> {
    return this.http.post<TimeSessionDto>(`${this.BASE}/start`, dto);
  }

  stop(id: string): Observable<TimeSessionDto> {
    return this.http.post<TimeSessionDto>(`${this.BASE}/${id}/stop`, null);
  }

  pause(id: string): Observable<TimeSessionDto> {
    return this.http.post<TimeSessionDto>(`${this.BASE}/${id}/pause`, null);
  }

  resume(id: string): Observable<TimeSessionDto> {
    return this.http.post<TimeSessionDto>(`${this.BASE}/${id}/resume`, null);
  }

  /** Returns null if nothing was active (204) */
  stopActive(): Observable<TimeSessionDto | null> {
    return this.http.post<TimeSessionDto>(`${this.BASE}/stop-active`, null).pipe(
      catchError(err => err.status === 204 ? of(null) : throwError(() => err)),
    );
  }
}
