import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { FullInternetTariff, InternetTariffDto } from '../../models/isp/internet-tariff.models';
import { environment } from '../../../environments/environment.development';
import { InternetTariffStatusesService } from './internet-tariff-statuses.service';
import { LocationTypesService } from './location-types.service';

@Injectable({
  providedIn: 'root'
})
export class InternetTariffsService {

  constructor(
    private http: HttpClient,
    private internetTariffStatusesService: InternetTariffStatusesService,
    private locationTypesService: LocationTypesService) {
  }

  getById(id: number): Observable<InternetTariffDto> {
    return this.http.get<InternetTariffDto>(`${environment.apiBaseUrl}/internettariffs/${id}`);
  }

  async get(): Promise<InternetTariffDto[]> {    
    return firstValueFrom(this.http.get<InternetTariffDto[]>(`${environment.apiBaseUrl}/internettariffs/all`));
  }

  async getByIdFull(id: number): Promise<FullInternetTariff> {
    const internetTariffDto = await firstValueFrom(this.getById(id));
      
    const fullInternetTariffStatus = await this.internetTariffStatusesService.getByIdFull(internetTariffDto.internetTariffStatusId);
    const fullLocationType = await this.locationTypesService.getByIdFull(internetTariffDto.locationTypeId);
      
    const fullClient = {
      id: internetTariffDto.id,
      internetTariffStatusId: internetTariffDto.internetTariffStatusId,
      locationTypeId: internetTariffDto.locationTypeId,
      name: internetTariffDto.name,
      price: internetTariffDto.price,
      internetSpeedMbits: internetTariffDto.internetSpeedMbits,
      description: internetTariffDto.description,
      internetTariffStatus: fullInternetTariffStatus,
      locationType: fullLocationType
    }
      
    return fullClient;
  }

  async getFull(): Promise<FullInternetTariff[]> {
    const internetTariffDtos = await this.get();

    const fullInternetTariffs: FullInternetTariff[] = [];
    
    for(const internetTariffDto of internetTariffDtos){
      const fullInternetTariffStatus = await this.internetTariffStatusesService.getByIdFull(internetTariffDto.internetTariffStatusId);
      const fullLocationType = await this.locationTypesService.getByIdFull(internetTariffDto.locationTypeId);
        
      const fullInternetTariff = {
        id: internetTariffDto.id,
        internetTariffStatusId: internetTariffDto.internetTariffStatusId,
        locationTypeId: internetTariffDto.locationTypeId,
        name: internetTariffDto.name,
        price: internetTariffDto.price,
        internetSpeedMbits: internetTariffDto.internetSpeedMbits,
        description: internetTariffDto.description,
        internetTariffStatus: fullInternetTariffStatus,
        locationType: fullLocationType
      }

      fullInternetTariffs.push(fullInternetTariff);
    }

    return fullInternetTariffs;
  }
}
