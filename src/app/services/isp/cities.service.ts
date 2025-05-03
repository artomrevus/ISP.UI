import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CityDto, FullCity } from '../../models/isp/city.models';
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

  getByIdFull(id: number): Promise<FullCity> {
    return firstValueFrom(this.getById(id));
  }
}
