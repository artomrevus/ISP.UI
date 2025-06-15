import { Injectable } from '@angular/core';
import { AddStreetDto, FullStreet, StreetDto, StreetFilterParameters, StreetSortOptions } from '../../models/isp/street.models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { CitiesService } from './cities.service';

@Injectable({
  providedIn: 'root'
})
export class StreetsService {

  constructor(
    private http: HttpClient,
    private citiesService: CitiesService) {
  }

  getById(id: number): Observable<StreetDto> {
    return this.http.get<StreetDto>(`${environment.apiBaseUrl}/streets/${id}`);
  }

  async get(): Promise<StreetDto[]> {
    return firstValueFrom(this.http.get<StreetDto[]>(`${environment.apiBaseUrl}/streets/all`));
  }

  async getFiltered(
    filter: StreetFilterParameters,
    sort: StreetSortOptions,
    pageNumber: number,
    pageSize: number
  ): Promise<{ items: StreetDto[]; totalCount: number; }> {

    let params = this.convertToHttpParams(filter)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (sort.sortBy) {
      params = params.set('sortBy', sort.sortBy);
      params = params.set('ascending', sort.ascending.toString());
    }

    var items = await firstValueFrom(this.http.get<StreetDto[]>(`${environment.apiBaseUrl}/streets`, { params }));
    var totalCount = await firstValueFrom(this.http.get<number>(`${environment.apiBaseUrl}/streets/count`, { params }));

    return { items, totalCount };
  }

  async update(dto: StreetDto): Promise<StreetDto> {
    return firstValueFrom(this.http.put<StreetDto>(`${environment.apiBaseUrl}/streets/${dto.id}`, dto));
  }

  async create(dto: AddStreetDto): Promise<StreetDto> {
    return firstValueFrom(this.http.post<StreetDto>(`${environment.apiBaseUrl}/streets`, dto));
  }

  async delete(id: number) {
    return firstValueFrom(this.http.delete<{}>(`${environment.apiBaseUrl}/streets/${id}`));
  }

  async getByIdFull(id: number): Promise<FullStreet> {
    const streetDto = await firstValueFrom(this.getById(id));

    const fullCity = await this.citiesService.getByIdFull(streetDto.cityId);

    const fullStreet = {
      id: streetDto.id,
      cityId: streetDto.cityId,
      streetName: streetDto.streetName,
      city: fullCity
    }

    return fullStreet;
  }

  async getFull(): Promise<FullStreet[]> {
    const streetDtos = await this.get();

    const fullStreets: FullStreet[] = [];

    for (const streetDto of streetDtos) {
      const fullCity = await this.citiesService.getByIdFull(streetDto.cityId);

      const fullStreet = {
        id: streetDto.id,
        cityId: streetDto.cityId,
        streetName: streetDto.streetName,
        city: fullCity
      }

      fullStreets.push(fullStreet);
    }

    return fullStreets;
  }

  async getFilteredFull(
    filter: StreetFilterParameters,
    sort: StreetSortOptions,
    pageNumber: number,
    pageSize: number
  ): Promise<{ items: FullStreet[]; totalCount: number; }> {
    const filterResult = await this.getFiltered(filter, sort, pageNumber, pageSize);
    const streetDtos = filterResult.items;

    const fullStreets: FullStreet[] = [];

    for (const streetDto of streetDtos) {
      const fullCity = await this.citiesService.getByIdFull(streetDto.cityId);

      const fullStreet = {
        id: streetDto.id,
        cityId: streetDto.cityId,
        streetName: streetDto.streetName,
        city: fullCity
      }

      fullStreets.push(fullStreet);
    }

    return {
      items: fullStreets,
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
