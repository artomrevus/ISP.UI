import { Injectable } from '@angular/core';
import { FullOffice, OfficeDto } from '../../models/isp/office.models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { CitiesService } from './cities.service';

@Injectable({
  providedIn: 'root'
})
export class OfficesService {

  constructor(
    private http: HttpClient,
    private citiesService: CitiesService) {
  }

  getById(id: number): Promise<OfficeDto> {
    return firstValueFrom(this.http.get<OfficeDto>(`${environment.apiBaseUrl}/offices/${id}`));
  }

  async get(): Promise<OfficeDto[]> {    
    return firstValueFrom(this.http.get<OfficeDto[]>(`${environment.apiBaseUrl}/offices/all`));
  }

  async getByIdFull(id: number): Promise<FullOffice> {
    
    const officeDto = await this.getById(id);
    const cityDto = await firstValueFrom(this.citiesService.getById(officeDto.cityId));

    const fullOffice = {
      id: officeDto.id,
      cityId: officeDto.cityId,
      address: officeDto.address,
      phoneNumber: officeDto.phoneNumber,
      email: officeDto.email,
      city: cityDto
    }

    return fullOffice;
  }

  async getFull(): Promise<FullOffice[]> {
    const officeDtos = await this.get();

    const fullOffices: FullOffice[] = [];
    
    for(const officeDto of officeDtos){
      const cityDto = await firstValueFrom(this.citiesService.getById(officeDto.cityId));
        
      const fullOffice = {
        id: officeDto.id,
        cityId: officeDto.cityId,
        address: officeDto.address,
        phoneNumber: officeDto.phoneNumber,
        email: officeDto.email,
        city: cityDto
      }

      fullOffices.push(fullOffice);
    }

    return fullOffices;
  }
}
