import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AddCityDto, CityDto, CityFilterParameters, CitySortOptions, FullCity } from '../../models/isp/city.models';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CitiesService {

  constructor(
    private http: HttpClient) {
  }

  getById(id: number): Observable<CityDto> {
    return this.http.get<CityDto>(`${environment.apiBaseUrl}/cities/${id}`);
  }

  async get(): Promise<CityDto[]> {
    return firstValueFrom(this.http.get<CityDto[]>(`${environment.apiBaseUrl}/cities/all`));
  }

  async getFiltered(
    filter: CityFilterParameters,
    sort: CitySortOptions,
    pageNumber: number,
    pageSize: number
  ): Promise<{ items: CityDto[]; totalCount: number; }> {

    let params = this.convertToHttpParams(filter)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (sort.sortBy) {
      params = params.set('sortBy', sort.sortBy);
      params = params.set('ascending', sort.ascending.toString());
    }

    var items = await firstValueFrom(this.http.get<CityDto[]>(`${environment.apiBaseUrl}/cities`, { params }));
    var totalCount = await firstValueFrom(this.http.get<number>(`${environment.apiBaseUrl}/cities/count`, { params }));

    return { items, totalCount };
  }

  async update(dto: CityDto): Promise<CityDto> {
    return firstValueFrom(this.http.put<CityDto>(`${environment.apiBaseUrl}/cities/${dto.id}`, dto));
  }

  async create(dto: AddCityDto): Promise<CityDto> {
    return firstValueFrom(this.http.post<CityDto>(`${environment.apiBaseUrl}/cities`, dto));
  }

  async delete(id: number) {
    return firstValueFrom(this.http.delete<{}>(`${environment.apiBaseUrl}/cities/${id}`));
  }

  getByIdFull(id: number): Promise<FullCity> {
    return firstValueFrom(this.getById(id));
  }

  async getFilteredFull(
    filter: CityFilterParameters,
    sort: CitySortOptions,
    pageNumber: number,
    pageSize: number
  ): Promise<{ items: FullCity[]; totalCount: number; }> {
    return this.getFiltered(filter, sort, pageNumber, pageSize);
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
