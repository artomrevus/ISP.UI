import { Injectable } from '@angular/core';
import { AddConnectionEquipmentDto, ConnectionEquipmentDto, FullConnectionEquipment } from '../../models/isp/connection-equipment.models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { firstValueFrom, Observable } from 'rxjs';
import { OfficeEquipmentsService } from './office-equipments.service';

@Injectable({
  providedIn: 'root'
})
export class ConnectionEquipmentsService {
  constructor(
    private http: HttpClient,
    private officeEquipmentsService: OfficeEquipmentsService) {
  }

  async getByConnection(connectionId: number): Promise<ConnectionEquipmentDto[]> {
    let params = new HttpParams();
    params = params.append('connectionIds', connectionId.toString());
    return firstValueFrom(this.http.get<ConnectionEquipmentDto[]>(`${environment.apiBaseUrl}/connectionequipments/all`, { params }));
  }

  create(dto: AddConnectionEquipmentDto): Observable<ConnectionEquipmentDto> {
    return this.http.post<ConnectionEquipmentDto>(`${environment.apiBaseUrl}/connectionequipments`, dto);
  }

  update(dto: ConnectionEquipmentDto): Observable<ConnectionEquipmentDto> {
    return this.http.put<ConnectionEquipmentDto>(`${environment.apiBaseUrl}/connectionequipments/${dto.id}`, dto);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/connectionequipments/${id}`);
  }

  // Only with required data
  async getByConnectionFull(connectionId: number): Promise<FullConnectionEquipment[]> {
    const connectionEquipmentDtos = await this.getByConnection(connectionId);

    const fullConnectionEquipments: FullConnectionEquipment[] = [];
    for (const connectionEquipmentDto of connectionEquipmentDtos) {
      const fullOfficeEquipment = await this.officeEquipmentsService.getByIdFull(connectionEquipmentDto.officeEquipmentId);
            
      const fullConnectionEquipment: FullConnectionEquipment = {
        id: connectionEquipmentDto.id,
        officeEquipmentId: connectionEquipmentDto.officeEquipmentId,
        connectionEquipmentAmount: connectionEquipmentDto.connectionEquipmentAmount,
        officeEquipment: fullOfficeEquipment
      }
    
      fullConnectionEquipments.push(fullConnectionEquipment);
    }

    return fullConnectionEquipments;
  }
}
