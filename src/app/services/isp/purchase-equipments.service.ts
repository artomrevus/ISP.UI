import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {firstValueFrom} from "rxjs";
import {environment} from "../../../environments/environment.development";
import {PurchaseEquipmentDto} from "../../models/isp/purchase-equipments.models";

@Injectable({
  providedIn: 'root'
})
export class PurchaseEquipmentsService {

  constructor(private http: HttpClient) { }

  async getByPurchase(purchaseId: number): Promise<PurchaseEquipmentDto[]> {
    let params = new HttpParams();
    params = params.append('purchaseIds', purchaseId.toString());
    return firstValueFrom(this.http.get<PurchaseEquipmentDto[]>(`${environment.apiBaseUrl}/purchaseequipments/all`, { params }));
  }

  getById(id: number): Promise<PurchaseEquipmentDto> {
    return firstValueFrom(this.http.get<PurchaseEquipmentDto>(`${environment.apiBaseUrl}/purchaseequipments/${id}`));
  }
}
