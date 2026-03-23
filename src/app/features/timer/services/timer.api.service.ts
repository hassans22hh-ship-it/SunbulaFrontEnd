// src/app/features/timer/services/timer.api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TimeSessionDto, StartSessionDto, PagedResult } from '@shared/models/timer.models';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class TimeSessionApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/api/TimeSession`;

  getAll(): Observable<TimeSessionDto[]> {
    return this.http.get<TimeSessionDto[]>(this.BASE);
  }

  getPaged(page = 1, pageSize = 20): Observable<PagedResult<TimeSessionDto>> {
    return this.http.get<PagedResult<TimeSessionDto>>(`${this.BASE}/paged`, {
      params: { page: page.toString(), pageSize: pageSize.toString() }
    });
  }

  /** Returns null when server responds 204 (no active session) */
  getActive(): Observable<TimeSessionDto | null> {
    return this.http.get<TimeSessionDto>(`${this.BASE}/active`).pipe(
      catchError(err => {
        if (err.status === 204) return of(null);
        throw err;
      })
    );
  }

  /** 409 = another session already running */
  start(dto: StartSessionDto): Observable<TimeSessionDto> {
    return this.http.post<TimeSessionDto>(`${this.BASE}/start`, dto);
  }

  stop(id: string): Observable<TimeSessionDto> {
    return this.http.post<TimeSessionDto>(`${this.BASE}/${id}/stop`, null);
  }

  /** Returns null when server responds 204 (nothing was active) */
  stopActive(): Observable<TimeSessionDto | null> {
    return this.http.post<TimeSessionDto>(`${this.BASE}/stop-active`, null).pipe(
      catchError(err => {
        if (err.status === 204) return of(null);
        throw err;
      })
    );
  }
}
