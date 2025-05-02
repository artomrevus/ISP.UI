import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ClientDto, FullClient } from '../../models/isp/client.models';
import { ClientStatusesService } from './client-statuses.service';
import { LocationsService } from './locations.service';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  constructor(
    private http: HttpClient,
    private clientStatusesService: ClientStatusesService,
    private locationsService: LocationsService) {
  }

  getById(id: number): Observable<ClientDto> {
    return this.http.get<ClientDto>(`${environment.apiBaseUrl}/clients/${id}`);
  }

  async getByIdFull(id: number): Promise<FullClient> {
    const clientDto = await firstValueFrom(this.getById(id));
      
    const fullClientStatus = await this.clientStatusesService.getByIdFull(clientDto.clientStatusId);
    const fullLocation = await this.locationsService.getByIdFull(clientDto.locationId);
      
    const fullClient = {
      id: clientDto.id,
      clientStatusId: clientDto.clientStatusId,
      locationId: clientDto.locationId,
      firstName: clientDto.firstName,
      lastName: clientDto.lastName,
      phoneNumber: clientDto.phoneNumber,
      email: clientDto.email,
      registrationDate: clientDto.registrationDate,
      clientStatus: fullClientStatus,
      location: fullLocation
    }
      
    return fullClient;
  }
}
