import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { ToastService } from '@shared/ui/toast/toast.service';
import { BYPASS_TOASTS } from '@core/http/error.interceptor';
import { DebtDto, DebtWithPaymentsDto, DebtSummaryDto, CreateDebtDto, RecordPaymentDto, DebtPaymentDto, UpdateDebtDto } from '@shared/models/debt.models';

@Injectable({ providedIn: 'root' })
export class DebtsApiService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly BASE = `${environment.apiUrl}/api/v1/Debt`;

  private get ctx() {
    return { context: new HttpContext().set(BYPASS_TOASTS, [404]) };
  }

  private handleError = (err: unknown) => {
    const error = err as { status?: number; message?: string };
    if (error.status === 404) {
      this.toast.error('Debt service is temporarily unavailable'); // Keep custom error for now or align if needed
      return throwError(() => new Error('Debt service is temporarily unavailable'));
    }
    return throwError(() => err);
  };

  // Queries
  getAll(): Observable<DebtDto[]> { return this.http.get<DebtDto[]>(this.BASE, this.ctx).pipe(catchError(this.handleError)); }
  getById(id: string): Observable<DebtDto> { return this.http.get<DebtDto>(`${this.BASE}/${id}`, this.ctx).pipe(catchError(this.handleError)); }
  getByIdWithPayments(id: string): Observable<DebtWithPaymentsDto> { 
    return this.http.get<DebtWithPaymentsDto>(`${this.BASE}/payments/${id}`, this.ctx).pipe(catchError(this.handleError)); 
  }
  getUnpaid(): Observable<DebtDto[]> { return this.http.get<DebtDto[]>(`${this.BASE}/unpaid`, this.ctx).pipe(catchError(this.handleError)); }
  getOverdue(): Observable<DebtDto[]> { return this.http.get<DebtDto[]>(`${this.BASE}/overdue`, this.ctx).pipe(catchError(this.handleError)); }
  getByType(type: string): Observable<DebtDto[]> { return this.http.get<DebtDto[]>(`${this.BASE}/by-type/${type}`, this.ctx).pipe(catchError(this.handleError)); }
  getSummary(): Observable<DebtSummaryDto> { return this.http.get<DebtSummaryDto>(`${this.BASE}/summary`, this.ctx).pipe(catchError(this.handleError)); }

  // Commands
  create(dto: CreateDebtDto): Observable<DebtDto> { return this.http.post<DebtDto>(this.BASE, dto, this.ctx).pipe(catchError(this.handleError)); }
  update(id: string, dto: UpdateDebtDto): Observable<DebtDto> { return this.http.put<DebtDto>(`${this.BASE}/${id}`, dto, this.ctx).pipe(catchError(this.handleError)); }
  recordPayment(debtId: string, dto: RecordPaymentDto): Observable<DebtPaymentDto> {
    // doc says POST /payments. We inject debtId into the body for the root endpoint
    return this.http.post<DebtPaymentDto>(`${this.BASE}/payments`, { ...dto, debtId }, this.ctx).pipe(catchError(this.handleError));
  }
  markPaid(id: string): Observable<void> { return this.http.post<void>(`${this.BASE}/${id}/mark-paid`, {}, this.ctx).pipe(catchError(this.handleError)); }
  reopen(id: string): Observable<void> { return this.http.post<void>(`${this.BASE}/${id}/reopen`, {}, this.ctx).pipe(catchError(this.handleError)); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.BASE}/${id}`, this.ctx).pipe(catchError(this.handleError)); }
}
