import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { TimerSessionDto, CreateTimerSessionDto, UpdateTimerSessionDto } from '../models/timer.models';

@Injectable({ providedIn: 'root' })
export class TimerApiService {
  private readonly http = inject(HttpClient);
  // Backend contract mentions endpoints gap, assuming a standard REST structure if it existed
  // but for V1 we will store this via the API if the endpoint exists, or mock it in the store if it doesn't.
  // We'll wire the API calls, but the actual save logic might need to handle 404s gracefully if the backend isn't ready.
  private readonly base = `${environment.apiUrl}/api/v1/TimerSessions`;

  getAll(): Observable<TimerSessionDto[]> {
    return this.http.get<TimerSessionDto[]>(this.base);
  }

  create(dto: CreateTimerSessionDto): Observable<TimerSessionDto> {
    return this.http.post<TimerSessionDto>(this.base, dto);
  }

  update(id: string, dto: UpdateTimerSessionDto): Observable<TimerSessionDto> {
    return this.http.put<TimerSessionDto>(`${this.base}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
