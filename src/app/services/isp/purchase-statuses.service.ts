import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {firstValueFrom} from "rxjs";
import {environment} from "../../../environments/environment.development";
import {PurchaseStatusDto} from "../../models/isp/purchase-statuses.models";

@Injectable({
  providedIn: 'root'
})
export class PurchaseStatusesService {

  constructor(private http: HttpClient) { }

  getById(id: number): Promise<PurchaseStatusDto> {
    return firstValueFrom(this.http.get<PurchaseStatusDto>(`${environment.apiBaseUrl}/purchasestatuses/${id}`));
  }

  get(): Promise<PurchaseStatusDto[]> {
    return firstValueFrom(this.http.get<PurchaseStatusDto[]>(`${environment.apiBaseUrl}/purchasestatuses/all`));
  }
}
