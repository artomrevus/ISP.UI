import { Injectable } from '@angular/core';
import {
  AddConnectionTariffDto,
  ConnectionTariffDto,
  ConnectionTariffFilterParameters, ConnectionTariffSortOptions,
  FullConnectionTariff
} from '../../models/isp/connection-tariff.models';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import {DateFormatterService} from "../common/date-formatter.service";
import {FullSupplier, SupplierFilterParameters, SupplierSortOptions} from "../../models/isp/supplier.models";

@Injectable({
  providedIn: 'root'
})
export class ConnectionTariffsService {

  constructor(
    private http: HttpClient,
    private dateFormatterService: DateFormatterService) {
  }

  getById(id: number): Observable<ConnectionTariffDto> {
    return this.http.get<ConnectionTariffDto>(`${environment.apiBaseUrl}/connectiontariffs/${id}`);
  }

  getByIdFull(id: number): Promise<FullConnectionTariff> {
    return firstValueFrom(this.getById(id));
  }
    
  async getActive(): Promise<ConnectionTariffDto[]> {
    let params = new HttpParams();
    var today = this.dateFormatterService.formatDate(new Date());

    params = params.append('startDateTo', today);
    params = params.append('endDateFrom', today);
    const count = await firstValueFrom(this.http.get<number>(`${environment.apiBaseUrl}/connectiontariffs/count`, { params }));

    params = params.append('pageSize', count.toString());
    return firstValueFrom(this.http.get<ConnectionTariffDto[]>(`${environment.apiBaseUrl}/connectiontariffs`, { params }));
  }

  async getFiltered(
      filter: ConnectionTariffFilterParameters,
      sort: ConnectionTariffSortOptions,
      pageNumber: number,
      pageSize: number
  ): Promise<{ items: ConnectionTariffDto[]; totalCount: number; }> {
    let params = new HttpParams()
        .set('pageNumber', pageNumber.toString())
        .set('pageSize', pageSize.toString());

    if (sort.sortBy) {
      params = params.set('sortBy', sort.sortBy);
      params = params.set('ascending', sort.ascending.toString());
    }

    if (filter.nameContains) {
      params = params.set('nameContains', filter.nameContains);
    }

    if (filter.priceFrom !== undefined && filter.priceFrom !== null) {
      params = params.set('priceFrom', filter.priceFrom.toString());
    }

    if (filter.priceTo !== undefined && filter.priceTo !== null) {
      params = params.set('priceTo', filter.priceTo.toString());
    }

    if (filter.startDateFrom) {
      params = params.set('startDateFrom', filter.startDateFrom);
    }

    if (filter.startDateTo) {
      params = params.set('startDateTo', filter.startDateTo);
    }

    if (filter.endDateFrom) {
      params = params.set('endDateFrom', filter.endDateFrom);
    }

    if (filter.endDateTo) {
      params = params.set('endDateTo', filter.endDateTo);
    }

    var items = await firstValueFrom(this.http.get<ConnectionTariffDto[]>(`${environment.apiBaseUrl}/connectiontariffs`, { params }));
    var totalCount = await firstValueFrom(this.http.get<number>(`${environment.apiBaseUrl}/connectiontariffs/count`, { params }));

    return { items, totalCount };
  }

  async getFilteredFull(
      filter: ConnectionTariffFilterParameters,
      sort: ConnectionTariffSortOptions,
      pageNumber: number,
      pageSize: number
  ): Promise<{ items: FullConnectionTariff[]; totalCount: number; }> {
    return this.getFiltered(filter, sort, pageNumber, pageSize);
  }

  async update(dto: ConnectionTariffDto): Promise<ConnectionTariffDto> {
    return firstValueFrom(this.http.put<ConnectionTariffDto>(`${environment.apiBaseUrl}/connectiontariffs/${dto.id}`, dto));
  }

  async create(dto: AddConnectionTariffDto): Promise<ConnectionTariffDto> {
    return firstValueFrom(this.http.post<ConnectionTariffDto>(`${environment.apiBaseUrl}/connectiontariffs`, dto));
  }

  async delete(id: number) {
    return firstValueFrom(this.http.delete<{}>(`${environment.apiBaseUrl}/connectiontariffs/${id}`));
  }
}
