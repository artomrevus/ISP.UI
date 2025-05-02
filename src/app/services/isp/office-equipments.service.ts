import { Injectable } from '@angular/core';
import { FullOfficeEquipment, OfficeEquipmentDto } from '../../models/isp/office-equipment.models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { OfficesService } from './offices.service';
import { EquipmentsService } from './equipments.service';
import { EquipmentTypesService } from './equipment-types.service';
import { CitiesService } from './cities.service';

@Injectable({
  providedIn: 'root'
})
export class OfficeEquipmentsService {

  constructor(
    private http: HttpClient,
    private officesService: OfficesService,
    private equipmentsService: EquipmentsService) {
  }

  async getByOffice(officeId: number): Promise<OfficeEquipmentDto[]> {
    let params = new HttpParams();
    params = params.append('officeIds', officeId.toString());
    return firstValueFrom(this.http.get<OfficeEquipmentDto[]>(`${environment.apiBaseUrl}/officeequipments/all`, { params }));
  }

   getById(id: number): Observable<OfficeEquipmentDto> {
    return this.http.get<OfficeEquipmentDto>(`${environment.apiBaseUrl}/officeequipments/${id}`);
  }

  async getByOfficeFull(officeId: number): Promise<FullOfficeEquipment[]> {
    const officeEquipmentDtos = await this.getByOffice(officeId);

    const fullOfficeEquipments : FullOfficeEquipment[] = [];

    for(const officeEquipmentDto of officeEquipmentDtos){
      const fullOffice = await this.officesService.getByIdFull(officeEquipmentDto.officeId);
      const fullEquipment = await this.equipmentsService.getByIdFull(officeEquipmentDto.equipmentId);

      // Construct object
      const fullOfficeEquipment: FullOfficeEquipment = {
        id: officeEquipmentDto.id,
        officeId: officeEquipmentDto.officeId,
        equipmentId: officeEquipmentDto.equipmentId,
        officeEquipmentAmount: officeEquipmentDto.officeEquipmentAmount,
        office: fullOffice,
        equipment: fullEquipment
      }

      fullOfficeEquipments.push(fullOfficeEquipment);
    }

    return fullOfficeEquipments;
  }
  
  async getByIdFull(id: number): Promise<FullOfficeEquipment> {
    // Office equipment dto
    const officeEquipmentDto = await firstValueFrom(this.getById(id));

    // Related dtos
    const fullOffice = await this.officesService.getByIdFull(officeEquipmentDto.officeId);
    const fullEquipment = await this.equipmentsService.getByIdFull(officeEquipmentDto.equipmentId);

    // Construct object
    const fullOfficeEquipment: FullOfficeEquipment = {
      id: officeEquipmentDto.id,
      officeId: officeEquipmentDto.officeId,
      equipmentId: officeEquipmentDto.equipmentId,
      officeEquipmentAmount: officeEquipmentDto.officeEquipmentAmount,
      office: fullOffice,
      equipment: fullEquipment
    }

    return fullOfficeEquipment;
  }
}
