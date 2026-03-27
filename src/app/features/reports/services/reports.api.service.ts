import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TimeReportDto, ReportFilterDto } from '@shared/models/reports.models';

@Injectable({ providedIn: 'root' })
export class ReportsApiService {
  private readonly http = inject(HttpClient);
  // Using a hypothetical analytics endpoint based on the standard REST API for this project
  private readonly base = `${environment.apiUrl}/api/v1/Reports`;
  private readonly sessionBase = `${environment.apiUrl}/api/v1/TimeSession`;

  getReport(filters: ReportFilterDto): Observable<TimeReportDto> {
    return this.http.get<TimeReportDto>(`${this.base}/time`, { 
      params: { from: filters.from || '', to: filters.to || '' } 
    });
  }

  getTaskReport(from: string, to: string): Observable<any> {
    return this.http.get(`${this.base}/tasks`, { params: { from, to } });
  }

  getFinanceReport(from: string, to: string): Observable<any> {
    return this.http.get(`${this.base}/finance`, { params: { from, to } });
  }

  getDebtReport(from: string, to: string): Observable<any> {
    return this.http.get(`${this.base}/debt`, { params: { from, to } });
  }
}
