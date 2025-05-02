import { Injectable } from '@angular/core';
import { FullLocation, LocationDto } from '../../models/isp/location.models';
import { HttpClient } from '@angular/common/http';
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
}
