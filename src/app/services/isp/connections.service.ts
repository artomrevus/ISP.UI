import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { AddConnectionDto, ConnectionDto, FullConnection } from '../../models/isp/connection.models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { ConnectionTariffsService } from './connection-tariffs.service';
import { EmployeesService } from './employees.service';
import { ConnectionEquipmentsService } from './connection-equipments.service';

@Injectable({
  providedIn: 'root'
})
export class ConnectionsService {

  constructor(
    private http: HttpClient,
    private connectionTariffsService: ConnectionTariffsService,
    private employeesService: EmployeesService,
    private connectionEquipmentsService: ConnectionEquipmentsService) {
  }

  async getByIcrId(icrId: number): Promise<ConnectionDto | undefined> {
    let params = new HttpParams();
    params = params.append('internetConnectionRequestIds', icrId.toString());
    
    const connections = await firstValueFrom(this.http.get<ConnectionDto[]>(`${environment.apiBaseUrl}/connections`, { params }));
    return connections.length > 0 ? connections.at(0) : undefined;
  }

  create(dto: AddConnectionDto): Observable<ConnectionDto> {
    return this.http.post<ConnectionDto>(`${environment.apiBaseUrl}/connections`, dto);
  }

  update(dto: ConnectionDto): Observable<ConnectionDto> {
    return this.http.put<ConnectionDto>(`${environment.apiBaseUrl}/connections/${dto.id}`, dto);
  }

  async getByIcrIdFull(icrId: number): Promise<FullConnection | undefined> {
    const connectionDto = await this.getByIcrId(icrId);
    if(!connectionDto) return undefined;

    const fullConnectionTariff = await this.connectionTariffsService.getByIdFull(connectionDto.connectionTariffId);
    const fullEmployee = await this.employeesService.getByIdFull(connectionDto.employeeId);
    const fullConnectionEquipments = await this.connectionEquipmentsService.getByConnectionFull(connectionDto.id);

    const fullConnection: FullConnection = {
      id: connectionDto.id,
      internetConnectionRequestId: connectionDto.internetConnectionRequestId,
      connectionTariffId: connectionDto.connectionTariffId,
      employeeId: connectionDto.employeeId,
      totalPrice: connectionDto.totalPrice,
      connectionDate: connectionDto.connectionDate,
      connectionTariff: fullConnectionTariff,
      employee: fullEmployee,
      connectionEquipments: fullConnectionEquipments
    }

    return fullConnection;
  }
}
