import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { AddClientDto, ClientDto, ClientFilterParameters, ClientSortOptions, FullClient } from '../../models/isp/client.models';
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

  async getByStatus(statusId: number): Promise<ClientDto[]> {
    let params = new HttpParams();

    params = params.append('clientStatusIds', statusId.toString());
    const count = await firstValueFrom(this.http.get<number>(`${environment.apiBaseUrl}/clients/count`, { params }));

    params = params.append('pageSize', count.toString());
    return firstValueFrom(this.http.get<ClientDto[]>(`${environment.apiBaseUrl}/clients`, { params }));
  }

  async getFiltered(
    filter: ClientFilterParameters,
    sort: ClientSortOptions,
    pageNumber: number,
    pageSize: number
  ): Promise<{ items: ClientDto[]; totalCount: number; }> {

    let params = this.convertToHttpParams(filter)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (sort.sortBy) {
      params = params.set('sortBy', sort.sortBy);
      params = params.set('ascending', sort.ascending.toString());
    }

    var items = await firstValueFrom(this.http.get<ClientDto[]>(`${environment.apiBaseUrl}/clients`, { params }));
    var totalCount = await firstValueFrom(this.http.get<number>(`${environment.apiBaseUrl}/clients/count`, { params }));

    return { items, totalCount };
  }

  async update(dto: ClientDto): Promise<ClientDto> {
    return firstValueFrom(this.http.put<ClientDto>(`${environment.apiBaseUrl}/clients/${dto.id}`, dto));
  }

  async create(dto: AddClientDto): Promise<ClientDto> {
    return firstValueFrom(this.http.post<ClientDto>(`${environment.apiBaseUrl}/clients`, dto));
  }

  async delete(id: number) {
    return firstValueFrom(this.http.delete<{}>(`${environment.apiBaseUrl}/clients/${id}`));
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

  async getByStatusFull(statusId: number): Promise<FullClient[]> {
    const clientDtos = await this.getByStatus(statusId);

    const fullClients: FullClient[] = [];

    for (const clientDto of clientDtos) {
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

      fullClients.push(fullClient);
    }

    return fullClients;
  }

  async getFilteredFull(
    filter: ClientFilterParameters,
    sort: ClientSortOptions,
    pageNumber: number,
    pageSize: number
  ): Promise<{ items: FullClient[]; totalCount: number; }> {
    const filterResult = await this.getFiltered(filter, sort, pageNumber, pageSize);
    const clientDtos = filterResult.items;

    const fullClients: FullClient[] = [];

    for (const clientDto of clientDtos) {
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

      fullClients.push(fullClient);
    }

    return {
      items: fullClients,
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
