import { Injectable } from '@angular/core';
import {firstValueFrom, Observable} from "rxjs";
import {environment} from "../../../environments/environment.development";
import {
  AddSupplierDto,
  FullSupplier,
  SupplierDto,
  SupplierFilterParameters,
  SupplierSortOptions
} from "../../models/isp/supplier.models";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AddVacancyDto, VacancyDto} from "../../models/isp/vacancy.models";
import {PurchaseDto} from "../../models/isp/purchase.models";

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {

  constructor(private http: HttpClient) { }

  getById(id: number): Promise<SupplierDto> {
    return firstValueFrom(this.http.get<SupplierDto>(`${environment.apiBaseUrl}/suppliers/${id}`));
  }

  get(): Promise<SupplierDto[]> {
    return firstValueFrom(this.http.get<SupplierDto[]>(`${environment.apiBaseUrl}/suppliers/all`));
  }

  getByIdFull(id: number): Promise<FullSupplier> {
    return this.getById(id);
  }

  getFull(): Promise<FullSupplier[]> {
    return this.get();
  }

  async getFiltered(
      filter: SupplierFilterParameters,
      sort: SupplierSortOptions,
      pageNumber: number,
      pageSize: number
  ): Promise<{ items: SupplierDto[]; totalCount: number; }> {
    let params = new HttpParams()
        .set('pageNumber', pageNumber.toString())
        .set('pageSize', pageSize.toString());

    if (sort.sortBy) {
      params = params.set('sortBy', sort.sortBy);
      params = params.set('ascending', sort.ascending.toString());
    }

    if (filter.name) {
      params = params.set('name', filter.name);
    }

    if (filter.phoneNumber) {
      params = params.set('phoneNumber', filter.phoneNumber);
    }

    if (filter.email) {
      params = params.set('email', filter.email);
    }

    var items = await firstValueFrom(this.http.get<SupplierDto[]>(`${environment.apiBaseUrl}/suppliers`, { params }));
    var totalCount = await firstValueFrom(this.http.get<number>(`${environment.apiBaseUrl}/suppliers/count`, { params }));

    return { items, totalCount}
  }

  async getFilteredFull(
      filter: SupplierFilterParameters,
      sort: SupplierSortOptions,
      pageNumber: number,
      pageSize: number
  ): Promise<{ items: FullSupplier[]; totalCount: number; }> {
    return this.getFiltered(filter, sort, pageNumber, pageSize);
  }

  update(dto: SupplierDto): Observable<SupplierDto> {
    return this.http.put<SupplierDto>(`${environment.apiBaseUrl}/suppliers/${dto.id}`, dto);
  }

  create(dto: AddSupplierDto): Observable<SupplierDto> {
    return this.http.post<SupplierDto>(`${environment.apiBaseUrl}/suppliers`, dto);
  }

  delete(id: number) {
    return firstValueFrom(this.http.delete<{}>(`${environment.apiBaseUrl}/suppliers/${id}`));
  }
}
