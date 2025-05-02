import { Injectable } from '@angular/core';
import { FullLocationType, LocationTypeDto } from '../../models/isp/location-type.models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class LocationTypesService {

  constructor(
    private http: HttpClient) {
  }

  getById(id: number): Observable<LocationTypeDto> {
    return this.http.get<LocationTypeDto>(`${environment.apiBaseUrl}/locationtypes/${id}`);
  }

  async get(): Promise<LocationTypeDto[]> {    
    return firstValueFrom(this.http.get<LocationTypeDto[]>(`${environment.apiBaseUrl}/locationtypes/all`));
  }

  async getByIdFull(id: number): Promise<FullLocationType> {
    return firstValueFrom(this.getById(id));
  }
}
