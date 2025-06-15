import { Injectable } from '@angular/core';
import { AddLocationDto, FullLocation, LocationDto, LocationFilterParameters, LocationSortOptions } from '../../models/isp/location.models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { LocationTypesService } from './location-types.service';
import { HousesService } from './houses.service';

@Injectable({
  providedIn: 'root'
})
export class LocationsService {

  constructor(
    private http: HttpClient,
    private locationTypesService: LocationTypesService,
    private housesService: HousesService) {
  }

  getById(id: number): Observable<LocationDto> {
    return this.http.get<LocationDto>(`${environment.apiBaseUrl}/locations/${id}`);
  }

  get(): Promise<LocationDto[]> {
    return firstValueFrom(this.http.get<LocationDto[]>(`${environment.apiBaseUrl}/locations/all`));
  }

  async getFiltered(
    filter: LocationFilterParameters,
    sort: LocationSortOptions,
    pageNumber: number,
    pageSize: number
  ): Promise<{ items: LocationDto[]; totalCount: number; }> {

    let params = this.convertToHttpParams(filter)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (sort.sortBy) {
      params = params.set('sortBy', sort.sortBy);
      params = params.set('ascending', sort.ascending.toString());
    }

    var items = await firstValueFrom(this.http.get<LocationDto[]>(`${environment.apiBaseUrl}/locations`, { params }));
    var totalCount = await firstValueFrom(this.http.get<number>(`${environment.apiBaseUrl}/locations/count`, { params }));

    return { items, totalCount };
  }

  async update(dto: LocationDto): Promise<LocationDto> {
    return firstValueFrom(this.http.put<LocationDto>(`${environment.apiBaseUrl}/locations/${dto.id}`, dto));
  }

  async create(dto: AddLocationDto): Promise<LocationDto> {
    return firstValueFrom(this.http.post<LocationDto>(`${environment.apiBaseUrl}/locations`, dto));
  }

  async delete(id: number) {
    return firstValueFrom(this.http.delete<{}>(`${environment.apiBaseUrl}/locations/${id}`));
  }

  async getByIdFull(id: number): Promise<FullLocation> {
    const locationDto = await firstValueFrom(this.getById(id));

    const fullLocationType = await this.locationTypesService.getByIdFull(locationDto.locationTypeId);
    const fullHouse = await this.housesService.getByIdFull(locationDto.houseId);

    const fullLocation = {
      id: locationDto.id,
      locationTypeId: locationDto.locationTypeId,
      houseId: locationDto.houseId,
      apartmentNumber: locationDto.apartmentNumber,
      locationType: fullLocationType,
      house: fullHouse
    }

    return fullLocation;
  }

  async getFull(): Promise<FullLocation[]> {
    const locationDtos = await this.get();

    const fullLocations: FullLocation[] = [];
    for (const locationDto of locationDtos) {
      const fullLocationType = await this.locationTypesService.getByIdFull(locationDto.locationTypeId);
      const fullHouse = await this.housesService.getByIdFull(locationDto.houseId);

      const fullLocation = {
        id: locationDto.id,
        locationTypeId: locationDto.locationTypeId,
        houseId: locationDto.houseId,
        apartmentNumber: locationDto.apartmentNumber,
        locationType: fullLocationType,
        house: fullHouse
      }

      fullLocations.push(fullLocation);
    }

    return fullLocations;
  }

  async getFilteredFull(
    filter: LocationFilterParameters,
    sort: LocationSortOptions,
    pageNumber: number,
    pageSize: number
  ): Promise<{ items: FullLocation[]; totalCount: number; }> {
    const filterResult = await this.getFiltered(filter, sort, pageNumber, pageSize);
    const locationDtos = filterResult.items;

    const fullLocations: FullLocation[] = [];
    for (const locationDto of locationDtos) {
      const fullLocationType = await this.locationTypesService.getByIdFull(locationDto.locationTypeId);
      const fullHouse = await this.housesService.getByIdFull(locationDto.houseId);

      const fullLocation = {
        id: locationDto.id,
        locationTypeId: locationDto.locationTypeId,
        houseId: locationDto.houseId,
        apartmentNumber: locationDto.apartmentNumber,
        locationType: fullLocationType,
        house: fullHouse
      }

      fullLocations.push(fullLocation);
    }

    return {
      items: fullLocations,
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
