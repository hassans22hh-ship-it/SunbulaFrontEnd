import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { ToastService } from '@shared/ui/toast/toast.service';
import { BYPASS_TOASTS } from '@core/http/error.interceptor';
import { DebtDto, DebtWithPaymentsDto, DebtSummaryDto, CreateDebtDto, RecordPaymentDto, DebtPaymentDto } from '@shared/models/debt.models';

@Injectable({ providedIn: 'root' })
export class DebtsApiService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly BASE = `${environment.apiUrl}/api/v1/debts`;

  private get ctx() {
    return { context: new HttpContext().set(BYPASS_TOASTS, [404]) };
  }

  private handleError = (err: unknown) => {
    const error = err as { status?: number; message?: string };
    if (error.status === 404) {
      this.toast.error('Debt service is temporarily unavailable');
      return throwError(() => new Error('Debt service is temporarily unavailable'));
    }
    return throwError(() => err);
  };

  getAll(): Observable<DebtDto[]>                                  { return this.http.get<DebtDto[]>(this.BASE, this.ctx).pipe(catchError(this.handleError)); }
  getById(id: string): Observable<DebtWithPaymentsDto>             { return this.http.get<DebtWithPaymentsDto>(`${this.BASE}/${id}`, this.ctx).pipe(catchError(this.handleError)); }
  getSummary(): Observable<DebtSummaryDto>                         { return this.http.get<DebtSummaryDto>(`${this.BASE}/summary`, this.ctx).pipe(catchError(this.handleError)); }
  create(dto: CreateDebtDto): Observable<DebtDto>                  { return this.http.post<DebtDto>(this.BASE, dto, this.ctx).pipe(catchError(this.handleError)); }
  recordPayment(id: string, dto: RecordPaymentDto): Observable<DebtPaymentDto> {
    return this.http.post<DebtPaymentDto>(`${this.BASE}/${id}/payment`, dto, this.ctx).pipe(catchError(this.handleError));
  }
  delete(id: string): Observable<void>                              { return this.http.delete<void>(`${this.BASE}/${id}`, this.ctx).pipe(catchError(this.handleError)); }
}
