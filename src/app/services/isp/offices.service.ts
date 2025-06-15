import { Injectable } from '@angular/core';
import { AddOfficeDto, FullOffice, OfficeDto, OfficeFilterParameters, OfficeSortOptions } from '../../models/isp/office.models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { CitiesService } from './cities.service';

@Injectable({
  providedIn: 'root'
})
export class OfficesService {

  constructor(
    private http: HttpClient,
    private citiesService: CitiesService) {
  }

  getById(id: number): Promise<OfficeDto> {
    return firstValueFrom(this.http.get<OfficeDto>(`${environment.apiBaseUrl}/offices/${id}`));
  }

  async get(): Promise<OfficeDto[]> {
    return firstValueFrom(this.http.get<OfficeDto[]>(`${environment.apiBaseUrl}/offices/all`));
  }

  async getFiltered(
    filter: OfficeFilterParameters,
    sort: OfficeSortOptions,
    pageNumber: number,
    pageSize: number
  ): Promise<{ items: OfficeDto[]; totalCount: number; }> {

    let params = this.convertToHttpParams(filter)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (sort.sortBy) {
      params = params.set('sortBy', sort.sortBy);
      params = params.set('ascending', sort.ascending.toString());
    }

    var items = await firstValueFrom(this.http.get<OfficeDto[]>(`${environment.apiBaseUrl}/offices`, { params }));
    var totalCount = await firstValueFrom(this.http.get<number>(`${environment.apiBaseUrl}/offices/count`, { params }));

    return { items, totalCount };
  }

  async update(dto: OfficeDto): Promise<OfficeDto> {
    return firstValueFrom(this.http.put<OfficeDto>(`${environment.apiBaseUrl}/offices/${dto.id}`, dto));
  }

  async create(dto: AddOfficeDto): Promise<OfficeDto> {
    return firstValueFrom(this.http.post<OfficeDto>(`${environment.apiBaseUrl}/offices`, dto));
  }

  async delete(id: number) {
    return firstValueFrom(this.http.delete<{}>(`${environment.apiBaseUrl}/offices/${id}`));
  }

  async getByIdFull(id: number): Promise<FullOffice> {

    const officeDto = await this.getById(id);
    const cityDto = await firstValueFrom(this.citiesService.getById(officeDto.cityId));

    const fullOffice = {
      id: officeDto.id,
      cityId: officeDto.cityId,
      address: officeDto.address,
      phoneNumber: officeDto.phoneNumber,
      email: officeDto.email,
      city: cityDto
    }

    return fullOffice;
  }

  async getFull(): Promise<FullOffice[]> {
    const officeDtos = await this.get();

    const fullOffices: FullOffice[] = [];

    for (const officeDto of officeDtos) {
      const cityDto = await firstValueFrom(this.citiesService.getById(officeDto.cityId));

      const fullOffice = {
        id: officeDto.id,
        cityId: officeDto.cityId,
        address: officeDto.address,
        phoneNumber: officeDto.phoneNumber,
        email: officeDto.email,
        city: cityDto
      }

      fullOffices.push(fullOffice);
    }

    return fullOffices;
  }

  async getFilteredFull(
    filter: OfficeFilterParameters,
    sort: OfficeSortOptions,
    pageNumber: number,
    pageSize: number
  ): Promise<{ items: FullOffice[]; totalCount: number; }> {
    const filterResult = await this.getFiltered(filter, sort, pageNumber, pageSize);
    const officeDtos = filterResult.items;

    const fullOffices: FullOffice[] = [];

    for (const officeDto of officeDtos) {
      const cityDto = await firstValueFrom(this.citiesService.getById(officeDto.cityId));

      const fullOffice = {
        id: officeDto.id,
        cityId: officeDto.cityId,
        address: officeDto.address,
        phoneNumber: officeDto.phoneNumber,
        email: officeDto.email,
        city: cityDto
      }

      fullOffices.push(fullOffice);
    }

    return {
      items: fullOffices,
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
