import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FullHouse, HouseDto } from '../../models/isp/house.models';
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
}
