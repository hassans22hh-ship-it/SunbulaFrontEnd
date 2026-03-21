import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { WalletDto, CreateWalletDto, UpdateWalletDto } from '@features/finance/models/finance.models';

@Injectable({ providedIn: 'root' })
export class WalletsApiService {
  private readonly http = inject(HttpClient);
  // Extrapolating typical REST contract for the Finance module
  private readonly base = `${environment.apiUrl}/api/v1/Wallets`;

  getAll(): Observable<WalletDto[]> {
    return this.http.get<WalletDto[]>(this.base);
  }

  create(dto: CreateWalletDto): Observable<WalletDto> {
    return this.http.post<WalletDto>(this.base, dto);
  }

  update(id: string, dto: UpdateWalletDto): Observable<WalletDto> {
    return this.http.put<WalletDto>(`${this.base}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
