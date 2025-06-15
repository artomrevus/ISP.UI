import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AddHouseDto, FullHouse, HouseDto, HouseFilterParameters, HouseSortOptions } from '../../models/isp/house.models';
import { environment } from '../../../environments/environment.development';
import { firstValueFrom, Observable } from 'rxjs';
import { StreetsService } from './streets.service';

@Injectable({
  providedIn: 'root'
})
export class HousesService {

  constructor(
    private http: HttpClient,
    private streetsService: StreetsService) {
  }

  getById(id: number): Observable<HouseDto> {
    return this.http.get<HouseDto>(`${environment.apiBaseUrl}/houses/${id}`);
  }

  get(): Promise<HouseDto[]> {
    return firstValueFrom(this.http.get<HouseDto[]>(`${environment.apiBaseUrl}/houses/all`));
  }

  async getFiltered(
    filter: HouseFilterParameters,
    sort: HouseSortOptions,
    pageNumber: number,
    pageSize: number
  ): Promise<{ items: HouseDto[]; totalCount: number; }> {

    let params = this.convertToHttpParams(filter)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (sort.sortBy) {
      params = params.set('sortBy', sort.sortBy);
      params = params.set('ascending', sort.ascending.toString());
    }

    var items = await firstValueFrom(this.http.get<HouseDto[]>(`${environment.apiBaseUrl}/houses`, { params }));
    var totalCount = await firstValueFrom(this.http.get<number>(`${environment.apiBaseUrl}/houses/count`, { params }));

    return { items, totalCount };
  }

  async update(dto: HouseDto): Promise<HouseDto> {
    return firstValueFrom(this.http.put<HouseDto>(`${environment.apiBaseUrl}/houses/${dto.id}`, dto));
  }

  async create(dto: AddHouseDto): Promise<HouseDto> {
    return firstValueFrom(this.http.post<HouseDto>(`${environment.apiBaseUrl}/houses`, dto));
  }

  async delete(id: number) {
    return firstValueFrom(this.http.delete<{}>(`${environment.apiBaseUrl}/houses/${id}`));
  }

  async getByIdFull(id: number): Promise<FullHouse> {
    const houseDto = await firstValueFrom(this.getById(id));

    const fullStreet = await this.streetsService.getByIdFull(houseDto.streetId);

    const fullHouse = {
      id: houseDto.id,
      streetId: houseDto.streetId,
      houseNumber: houseDto.houseNumber,
      street: fullStreet
    }

    return fullHouse;
  }

  async getFull(): Promise<FullHouse[]> {
    const houseDtos = await this.get();

    const fullHouses: FullHouse[] = [];
    for (const houseDto of houseDtos) {
      const fullStreet = await this.streetsService.getByIdFull(houseDto.streetId);

      const fullHouse = {
        id: houseDto.id,
        streetId: houseDto.streetId,
        houseNumber: houseDto.houseNumber,
        street: fullStreet
      }

      fullHouses.push(fullHouse);
    }

    return fullHouses;
  }

  async getFilteredFull(
    filter: HouseFilterParameters,
    sort: HouseSortOptions,
    pageNumber: number,
    pageSize: number
  ): Promise<{ items: FullHouse[]; totalCount: number; }> {
    const filterResult = await this.getFiltered(filter, sort, pageNumber, pageSize);
    const houseDtos = filterResult.items;

    const fullHouses: FullHouse[] = [];
    for (const houseDto of houseDtos) {
      const fullStreet = await this.streetsService.getByIdFull(houseDto.streetId);

      const fullHouse = {
        id: houseDto.id,
        streetId: houseDto.streetId,
        houseNumber: houseDto.houseNumber,
        street: fullStreet
      }

      fullHouses.push(fullHouse);
    }

    return {
      items: fullHouses,
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
