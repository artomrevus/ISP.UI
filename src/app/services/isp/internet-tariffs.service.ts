import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { AddInternetTariffDto, FullInternetTariff, InternetTariffDto, InternetTariffFilterParameters, InternetTariffSortOptions } from '../../models/isp/internet-tariff.models';
import { environment } from '../../../environments/environment.development';
import { InternetTariffStatusesService } from './internet-tariff-statuses.service';
import { LocationTypesService } from './location-types.service';

@Injectable({
  providedIn: 'root'
})
export class InternetTariffsService {

  constructor(
    private http: HttpClient,
    private internetTariffStatusesService: InternetTariffStatusesService,
    private locationTypesService: LocationTypesService) {
  }

  getById(id: number): Observable<InternetTariffDto> {
    return this.http.get<InternetTariffDto>(`${environment.apiBaseUrl}/internettariffs/${id}`);
  }

  async get(): Promise<InternetTariffDto[]> {
    return firstValueFrom(this.http.get<InternetTariffDto[]>(`${environment.apiBaseUrl}/internettariffs/all`));
  }

  async getByStatus(statusId: number): Promise<InternetTariffDto[]> {
    let params = new HttpParams();

    params = params.append('internetTariffStatusIds', statusId.toString());
    const count = await firstValueFrom(this.http.get<number>(`${environment.apiBaseUrl}/internettariffs/count`, { params }));

    params = params.append('pageSize', count.toString());
    return firstValueFrom(this.http.get<InternetTariffDto[]>(`${environment.apiBaseUrl}/internettariffs`, { params }));
  }

  async getFiltered(
    filter: InternetTariffFilterParameters,
    sort: InternetTariffSortOptions,
    pageNumber: number,
    pageSize: number
  ): Promise<{ items: InternetTariffDto[]; totalCount: number; }> {

    let params = this.convertToHttpParams(filter)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (sort.sortBy) {
      params = params.set('sortBy', sort.sortBy);
      params = params.set('ascending', sort.ascending.toString());
    }

    var items = await firstValueFrom(this.http.get<InternetTariffDto[]>(`${environment.apiBaseUrl}/internettariffs`, { params }));
    var totalCount = await firstValueFrom(this.http.get<number>(`${environment.apiBaseUrl}/internettariffs/count`, { params }));

    return { items, totalCount };
  }

  async update(dto: InternetTariffDto): Promise<InternetTariffDto> {
    return firstValueFrom(this.http.put<InternetTariffDto>(`${environment.apiBaseUrl}/internettariffs/${dto.id}`, dto));
  }

  async create(dto: AddInternetTariffDto): Promise<InternetTariffDto> {
    return firstValueFrom(this.http.post<InternetTariffDto>(`${environment.apiBaseUrl}/internettariffs`, dto));
  }

  async delete(id: number) {
    return firstValueFrom(this.http.delete<{}>(`${environment.apiBaseUrl}/internettariffs/${id}`));
  }

  async getByIdFull(id: number): Promise<FullInternetTariff> {
    const internetTariffDto = await firstValueFrom(this.getById(id));

    const fullInternetTariffStatus = await this.internetTariffStatusesService.getByIdFull(internetTariffDto.internetTariffStatusId);
    const fullLocationType = await this.locationTypesService.getByIdFull(internetTariffDto.locationTypeId);

    return {
      id: internetTariffDto.id,
      internetTariffStatusId: internetTariffDto.internetTariffStatusId,
      locationTypeId: internetTariffDto.locationTypeId,
      name: internetTariffDto.name,
      price: internetTariffDto.price,
      internetSpeedMbits: internetTariffDto.internetSpeedMbits,
      description: internetTariffDto.description,
      internetTariffStatus: fullInternetTariffStatus,
      locationType: fullLocationType
    };
  }

  async getFull(): Promise<FullInternetTariff[]> {
    const internetTariffDtos = await this.get();

    const fullInternetTariffs: FullInternetTariff[] = [];

    for (const internetTariffDto of internetTariffDtos) {
      const fullInternetTariffStatus = await this.internetTariffStatusesService.getByIdFull(internetTariffDto.internetTariffStatusId);
      const fullLocationType = await this.locationTypesService.getByIdFull(internetTariffDto.locationTypeId);

      const fullInternetTariff = {
        id: internetTariffDto.id,
        internetTariffStatusId: internetTariffDto.internetTariffStatusId,
        locationTypeId: internetTariffDto.locationTypeId,
        name: internetTariffDto.name,
        price: internetTariffDto.price,
        internetSpeedMbits: internetTariffDto.internetSpeedMbits,
        description: internetTariffDto.description,
        internetTariffStatus: fullInternetTariffStatus,
        locationType: fullLocationType
      }

      fullInternetTariffs.push(fullInternetTariff);
    }

    return fullInternetTariffs;
  }

  async getByStatusFull(statusId: number): Promise<FullInternetTariff[]> {
    const internetTariffDtos = await this.getByStatus(statusId);

    const fullInternetTariffs: FullInternetTariff[] = [];

    for (const internetTariffDto of internetTariffDtos) {
      const fullInternetTariffStatus = await this.internetTariffStatusesService.getByIdFull(internetTariffDto.internetTariffStatusId);
      const fullLocationType = await this.locationTypesService.getByIdFull(internetTariffDto.locationTypeId);

      const fullInternetTariff = {
        id: internetTariffDto.id,
        internetTariffStatusId: internetTariffDto.internetTariffStatusId,
        locationTypeId: internetTariffDto.locationTypeId,
        name: internetTariffDto.name,
        price: internetTariffDto.price,
        internetSpeedMbits: internetTariffDto.internetSpeedMbits,
        description: internetTariffDto.description,
        internetTariffStatus: fullInternetTariffStatus,
        locationType: fullLocationType
      }

      fullInternetTariffs.push(fullInternetTariff);
    }

    return fullInternetTariffs;
  }

  async getFilteredFull(
    filter: InternetTariffFilterParameters,
    sort: InternetTariffSortOptions,
    pageNumber: number,
    pageSize: number
  ): Promise<{ items: FullInternetTariff[]; totalCount: number; }> {
    const filterResult = await this.getFiltered(filter, sort, pageNumber, pageSize);
    const internetTariffDtos = filterResult.items;

    const fullInternetTariffs: FullInternetTariff[] = [];

    for (const internetTariffDto of internetTariffDtos) {
      const fullInternetTariffStatus = await this.internetTariffStatusesService.getByIdFull(internetTariffDto.internetTariffStatusId);
      const fullLocationType = await this.locationTypesService.getByIdFull(internetTariffDto.locationTypeId);

      const fullInternetTariff = {
        id: internetTariffDto.id,
        internetTariffStatusId: internetTariffDto.internetTariffStatusId,
        locationTypeId: internetTariffDto.locationTypeId,
        name: internetTariffDto.name,
        price: internetTariffDto.price,
        internetSpeedMbits: internetTariffDto.internetSpeedMbits,
        description: internetTariffDto.description,
        internetTariffStatus: fullInternetTariffStatus,
        locationType: fullLocationType
      }

      fullInternetTariffs.push(fullInternetTariff);
    }

    return {
      items: fullInternetTariffs,
      totalCount: filterResult.totalCount,
    };
  }

  private convertToHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      const value = params[key];
      if (Array.isArray(value)) {
        value.forEach(item => {
          httpParams = httpParams.append(`${key}`, item);
        });
      } else if (value) {
        httpParams = httpParams.append(key, value);
      }
    });

    return httpParams;
  }
}
