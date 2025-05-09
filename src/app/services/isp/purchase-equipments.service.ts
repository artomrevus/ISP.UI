import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {firstValueFrom} from "rxjs";
import {environment} from "../../../environments/environment.development";
import {
  AddPurchaseEquipmentDto,
  FullPurchaseEquipment,
  PurchaseEquipmentDto
} from "../../models/isp/purchase-equipments.models";
import {AddPurchaseDto, FullPurchase, PurchaseDto} from "../../models/isp/purchase.models";
import {EquipmentsService} from "./equipments.service";
import {EquipmentPlacementsService} from "./equipment-placements.service";

@Injectable({
  providedIn: 'root'
})
export class PurchaseEquipmentsService {

  constructor(
      private http: HttpClient,
      private equipmentsService: EquipmentsService,
      private equipmentPlacementsService: EquipmentPlacementsService,) { }

  async getByPurchase(purchaseId: number): Promise<PurchaseEquipmentDto[]> {
    let params = new HttpParams();
    params = params.append('purchaseIds', purchaseId.toString());
    return firstValueFrom(this.http.get<PurchaseEquipmentDto[]>(`${environment.apiBaseUrl}/purchaseequipments/all`, { params }));
  }

  getById(id: number): Promise<PurchaseEquipmentDto> {
    return firstValueFrom(this.http.get<PurchaseEquipmentDto>(`${environment.apiBaseUrl}/purchaseequipments/${id}`));
  }

  delete(id: number) {
    return firstValueFrom(this.http.delete<{}>(`${environment.apiBaseUrl}/purchaseequipments/${id}`));
  }

  create(dto: AddPurchaseEquipmentDto): Promise<PurchaseEquipmentDto> {
    return firstValueFrom(this.http.post<PurchaseEquipmentDto>(`${environment.apiBaseUrl}/purchaseequipments`, dto));
  }

  async getByPurchaseFull(purchaseId: number): Promise<FullPurchaseEquipment[]> {
    const purchaseEquipmentDtos = await this.getByPurchase(purchaseId);

    const fullPurchaseEquipments: FullPurchaseEquipment[] = [];

    for (const purchaseEquipmentDto of purchaseEquipmentDtos) {
      const fullEquipment = await this.equipmentsService.getByIdFull(purchaseEquipmentDto.equipmentId);
      const fullEquipmentPlacement = await this.equipmentPlacementsService.getByPurchaseEquipmentFull(purchaseEquipmentDto.id);

      const fullPurchaseEquipment: FullPurchaseEquipment = {
        id: purchaseEquipmentDto.id,
        purchaseId: purchaseEquipmentDto.purchaseId,
        equipmentId: purchaseEquipmentDto.equipmentId,
        purchaseEquipmentAmount: purchaseEquipmentDto.purchaseEquipmentAmount,
        price: purchaseEquipmentDto.price,
        equipment: fullEquipment,
        equipmentPlacements: fullEquipmentPlacement
      };

      fullPurchaseEquipments.push(fullPurchaseEquipment);
    }

    return fullPurchaseEquipments;
  }
}
