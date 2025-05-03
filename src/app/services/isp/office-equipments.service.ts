import {Injectable} from '@angular/core';
import {AddOfficeEquipmentDto, FullOfficeEquipment, OfficeEquipmentDto} from '../../models/isp/office-equipment.models';
import {HttpClient, HttpParams} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {environment} from '../../../environments/environment.development';
import {OfficesService} from './offices.service';
import {EquipmentsService} from './equipments.service';
import {AddPurchaseDto, PurchaseDto} from "../../models/isp/purchase.models";

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

  async get(officeId: number, equipmentId: number): Promise<OfficeEquipmentDto | undefined> {
    let params = new HttpParams();
    params = params.append('officeIds', officeId.toString());
    params = params.append('equipmentIds', equipmentId.toString());
    const officeEquipments = await firstValueFrom(
        this.http.get<OfficeEquipmentDto[]>(`${environment.apiBaseUrl}/officeequipments/all`, { params }));

    return officeEquipments[0];
  }

  getById(id: number): Promise<OfficeEquipmentDto> {
    return firstValueFrom(this.http.get<OfficeEquipmentDto>(`${environment.apiBaseUrl}/officeequipments/${id}`));
  }

  create(dto: AddOfficeEquipmentDto): Promise<OfficeEquipmentDto> {
    return firstValueFrom(this.http.post<OfficeEquipmentDto>(`${environment.apiBaseUrl}/officeequipments`, dto));
  }

  update(dto: OfficeEquipmentDto): Promise<OfficeEquipmentDto> {
    return firstValueFrom(this.http.put<OfficeEquipmentDto>(`${environment.apiBaseUrl}/officeequipments/${dto.id}`, dto));
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
    const officeEquipmentDto = await this.getById(id);

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
