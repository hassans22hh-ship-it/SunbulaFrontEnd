import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { WalletDto, CreateWalletDto, UpdateWalletDto, FinanceSummaryDto } from '@shared/models/finance.models';

@Injectable({ providedIn: 'root' })
export class WalletsApiService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/api/v1/Wallets`;

  getAll(): Observable<WalletDto[]>                              { return this.http.get<WalletDto[]>(this.BASE); }
  getById(id: string): Observable<WalletDto>                     { return this.http.get<WalletDto>(`${this.BASE}/${id}`); }
  getSummary(): Observable<FinanceSummaryDto>                     { return this.http.get<FinanceSummaryDto>(`${this.BASE}/summary`); }
  create(dto: CreateWalletDto): Observable<WalletDto>             { return this.http.post<WalletDto>(this.BASE, dto); }
  update(id: string, dto: UpdateWalletDto): Observable<WalletDto> { return this.http.put<WalletDto>(`${this.BASE}/${id}`, dto); }
  delete(id: string): Observable<void>                            { return this.http.delete<void>(`${this.BASE}/${id}`); }
}
