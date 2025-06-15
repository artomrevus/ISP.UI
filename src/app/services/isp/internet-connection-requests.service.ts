import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AddInternetConnectionRequestDto, FullInternetConnectionRequest, InternetConnectionRequestDto } from '../../models/isp/internet-connection-request.models';
import { environment } from '../../../environments/environment.development';
import { firstValueFrom, map, Observable } from 'rxjs';
import { ClientsService } from './clients.service';
import { InternetTariffsService } from './internet-tariffs.service';
import { InternetConnectionRequestStatusesService } from './internet-connection-request-statuses.service';
import { ConnectionsService } from './connections.service';

@Injectable({
  providedIn: 'root'
})
export class InternetConnectionRequestsService {

  constructor(
    private http: HttpClient,
    private clientsService: ClientsService,
    private internetTariffsService: InternetTariffsService,
    private icrStatusesService: InternetConnectionRequestStatusesService,
    private connectionsService: ConnectionsService
  ) {
  }

  getById(id: number): Observable<InternetConnectionRequestDto> {
    return this.http.get<InternetConnectionRequestDto>(`${environment.apiBaseUrl}/internetconnectionrequests/${id}`);
  }

  get(params: any): Observable<InternetConnectionRequestDto[]> {
    const httpParams = this.convertToHttpParams(params);
    return this.http.get<InternetConnectionRequestDto[]>(`${environment.apiBaseUrl}/internetconnectionrequests`, { params: httpParams });
  }

  getCount(params: any): Observable<number> {
    const httpParams = this.convertToHttpParams(params);
    return this.http.get<number>(`${environment.apiBaseUrl}/internetconnectionrequests/count`, { params: httpParams });
  }

  create(dto: AddInternetConnectionRequestDto): Observable<InternetConnectionRequestDto> {
    return this.http.post<InternetConnectionRequestDto>(`${environment.apiBaseUrl}/internetconnectionrequests`, dto);
  }

  update(icr: InternetConnectionRequestDto): Observable<InternetConnectionRequestDto> {
    return this.http.put<InternetConnectionRequestDto>(`${environment.apiBaseUrl}/internetconnectionrequests/${icr.id}`, icr);
  }

  async getByIdFull(id: number): Promise<FullInternetConnectionRequest> {
    const icrDto = await firstValueFrom(this.getById(id));

    const fullClient = await this.clientsService.getByIdFull(icrDto.clientId);
    const fullInternetTariff = await this.internetTariffsService.getByIdFull(icrDto.internetTariffId);
    const fullIcrStatus = await this.icrStatusesService.getByIdFull(icrDto.internetConnectionRequestStatusId);
    const fullConnection = await this.connectionsService.getByIcrIdFull(icrDto.id);
    
    return {
        id: icrDto.id,
        clientId: icrDto.clientId,
        internetTariffId: icrDto.internetTariffId,
        internetConnectionRequestStatusId: icrDto.internetConnectionRequestStatusId,
        number: icrDto.number,
        requestDate: icrDto.requestDate,
        client: fullClient,
        internetTariff: fullInternetTariff,
        internetConnectionRequestStatus: fullIcrStatus,
        connection: fullConnection
      };
  }

  async getFull(params: any): Promise<FullInternetConnectionRequest[]> {

    const icrDtos = await firstValueFrom(this.get(params));

    const fullIcrs: FullInternetConnectionRequest[] = [];

    for (const icrDto of icrDtos) {
      const fullClient = await this.clientsService.getByIdFull(icrDto.clientId);
      const fullInternetTariff = await this.internetTariffsService.getByIdFull(icrDto.internetTariffId);
      const fullIcrStatus = await this.icrStatusesService.getByIdFull(icrDto.internetConnectionRequestStatusId);
      const fullConnection = await this.connectionsService.getByIcrIdFull(icrDto.id);

      const fullIcr: FullInternetConnectionRequest = {
        id: icrDto.id,
        clientId: icrDto.clientId,
        internetTariffId: icrDto.internetTariffId,
        internetConnectionRequestStatusId: icrDto.internetConnectionRequestStatusId,
        number: icrDto.number,
        requestDate: icrDto.requestDate,
        client: fullClient,
        internetTariff: fullInternetTariff,
        internetConnectionRequestStatus: fullIcrStatus,
        connection: fullConnection
      };

      fullIcrs.push(fullIcr);
    }

    return fullIcrs;
  }

  private convertToHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      const value = params[key];
      if (Array.isArray(value)) {
        value.forEach(item => {
          httpParams = httpParams.append(`${key}`, item);
        });
      } else if (value !== null && value !== undefined) {
        httpParams = httpParams.append(key, value);
      }
    });

    return httpParams;
  }
}
