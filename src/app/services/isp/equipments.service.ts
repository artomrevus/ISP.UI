import { Injectable } from '@angular/core';
import { EquipmentDto, FullEquipment } from '../../models/isp/equipment.models';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { EquipmentTypesService } from './equipment-types.service';

@Injectable({
  providedIn: 'root'
})
export class EquipmentsService {

  constructor(
    private http: HttpClient,
    private equipmentTypesService: EquipmentTypesService) {
  }

  getById(id: number): Observable<EquipmentDto> {
    return this.http.get<EquipmentDto>(`${environment.apiBaseUrl}/equipments/${id}`);
  }

  get(): Promise<EquipmentDto[]> {
    return firstValueFrom(this.http.get<EquipmentDto[]>(`${environment.apiBaseUrl}/equipments/all`));
  }

  async getByIdFull(id: number): Promise<FullEquipment> {
    const equipmentDto = await firstValueFrom(this.getById(id));
    const fullEquipmentType = await this.equipmentTypesService.getByIdFull(equipmentDto.equipmentTypeId);

    const fullEquipment = {
      id: equipmentDto.id,
      name: equipmentDto.name,
      price: equipmentDto.price,
      equipmentTypeId: equipmentDto.equipmentTypeId,
      equipmentType: fullEquipmentType
    }

    return fullEquipment;
  }

  async getFull(): Promise<FullEquipment[]> {
    const equipmentDtos = await this.get();

    const fullEquipments: FullEquipment[] = [];
    for(const equipmentDto of equipmentDtos){
      const fullEquipmentType = await this.equipmentTypesService.getByIdFull(equipmentDto.equipmentTypeId);

      const fullEquipment = {
        id: equipmentDto.id,
        name: equipmentDto.name,
        price: equipmentDto.price,
        equipmentTypeId: equipmentDto.equipmentTypeId,
        equipmentType: fullEquipmentType
      }

      fullEquipments.push(fullEquipment);
    }

    return fullEquipments;
  }
}
