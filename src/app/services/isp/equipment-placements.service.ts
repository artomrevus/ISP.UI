import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {firstValueFrom} from "rxjs";
import {environment} from "../../../environments/environment.development";
import {
  AddEquipmentPlacementDto,
  EquipmentPlacementDto,
  FullEquipmentPlacement
} from "../../models/isp/equipment-placement.models";
import {EmployeesService} from "./employees.service";
import {OfficeEquipmentsService} from "./office-equipments.service";

@Injectable({
  providedIn: 'root'
})
export class EquipmentPlacementsService {

  constructor(
      private http: HttpClient,
      private employeesService: EmployeesService,
      private officeEquipmentsService: OfficeEquipmentsService,) { }

  getByPurchaseEquipment(purchaseEquipmentId: number): Promise<EquipmentPlacementDto[]> {
    let params = new HttpParams();
    params = params.append('purchaseEquipmentIds', purchaseEquipmentId.toString());
    return firstValueFrom(this.http.get<EquipmentPlacementDto[]>(`${environment.apiBaseUrl}/equipmentplacements/all`, { params }));
  }

  create(dto: AddEquipmentPlacementDto): Promise<EquipmentPlacementDto> {
    return firstValueFrom(this.http.post<EquipmentPlacementDto>(`${environment.apiBaseUrl}/equipmentplacements`, dto));
  }

  update(dto: EquipmentPlacementDto): Promise<EquipmentPlacementDto> {
    return firstValueFrom(this.http.put<EquipmentPlacementDto>(`${environment.apiBaseUrl}/equipmentplacements/${dto.id}`, dto));
  }

  delete(id: number) {
    return firstValueFrom(this.http.delete<{}>(`${environment.apiBaseUrl}/equipmentplacements/${id}`));
  }

  async getByPurchaseEquipmentFull(purchaseEquipmentId: number): Promise<FullEquipmentPlacement[]> {
    const equipmentPlacementDtos = await this.getByPurchaseEquipment(purchaseEquipmentId);

    const fullPurchaseEquipments: FullEquipmentPlacement[] = [];
    for (const equipmentPlacementDto of equipmentPlacementDtos) {
      const fullEmployee = await this.employeesService.getByIdFull(equipmentPlacementDto.employeeId);
      const fullOfficeEquipment = await this.officeEquipmentsService.getByIdFull(equipmentPlacementDto.officeEquipmentId);

      const fullPurchaseEquipment: FullEquipmentPlacement = {
        id: equipmentPlacementDto.id,
        employeeId: equipmentPlacementDto.employeeId,
        purchaseEquipmentId: equipmentPlacementDto.purchaseEquipmentId,
        officeEquipmentId: equipmentPlacementDto.officeEquipmentId,
        equipmentPlacementAmount: equipmentPlacementDto.equipmentPlacementAmount,
        date: equipmentPlacementDto.date,
        employee: fullEmployee,
        officeEquipment: fullOfficeEquipment
      }

      fullPurchaseEquipments.push(fullPurchaseEquipment);
    }

    return fullPurchaseEquipments;
  }
}
