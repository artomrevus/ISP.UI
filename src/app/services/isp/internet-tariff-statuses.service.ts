import { Injectable } from '@angular/core';
import { FullInternetTariffStatus, InternetTariffStatusDto } from '../../models/isp/internet-tariff-status.models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class InternetTariffStatusesService {

  constructor(
    private http: HttpClient) {
  }

  getById(id: number): Observable<InternetTariffStatusDto> {
    return this.http.get<InternetTariffStatusDto>(`${environment.apiBaseUrl}/internettariffstatuses/${id}`);
  }

  async getByIdFull(id: number): Promise<FullInternetTariffStatus> {
    return firstValueFrom(this.getById(id));
  }

  async get(): Promise<InternetTariffStatusDto[]> {    
    return firstValueFrom(this.http.get<InternetTariffStatusDto[]>(`${environment.apiBaseUrl}/internettariffstatuses/all`));
  }
}
