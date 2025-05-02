import { Injectable } from '@angular/core';
import { FullStreet, StreetDto } from '../../models/isp/street.models';
import { HttpClient } from '@angular/common/http';
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
}
