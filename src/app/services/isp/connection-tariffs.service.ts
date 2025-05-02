import { Injectable } from '@angular/core';
import { ConnectionTariffDto, FullConnectionTariff } from '../../models/isp/connection-tariff.models';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ConnectionTariffsService {

  constructor(
    private http: HttpClient) {
  }

  getById(id: number): Observable<ConnectionTariffDto> {
    return this.http.get<ConnectionTariffDto>(`${environment.apiBaseUrl}/connectiontariffs/${id}`);
  }

  getByIdFull(id: number): Promise<FullConnectionTariff> {
    return firstValueFrom(this.getById(id));
  }
    
  async getActive(): Promise<ConnectionTariffDto[]> {

    let params = new HttpParams();
    var today = this.formatDate(new Date());

    params = params.append('startDateTo', today);
    params = params.append('endDateFrom', today);
    const count = await firstValueFrom(this.http.get<number>(`${environment.apiBaseUrl}/connectiontariffs/count`, { params }));

    params = params.append('pageSize', count.toString());
    return firstValueFrom(this.http.get<ConnectionTariffDto[]>(`${environment.apiBaseUrl}/connectiontariffs`, { params }));
  }

  formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      return date.split('T')[0];
    }
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
