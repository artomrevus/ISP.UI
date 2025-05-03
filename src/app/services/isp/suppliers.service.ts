import { Injectable } from '@angular/core';
import {firstValueFrom} from "rxjs";
import {environment} from "../../../environments/environment.development";
import {SupplierDto} from "../../models/isp/supplier.models";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {

  constructor(private http: HttpClient) { }

  getById(id: number): Promise<SupplierDto> {
    return firstValueFrom(this.http.get<SupplierDto>(`${environment.apiBaseUrl}/suppliers/${id}`));
  }

  get(): Promise<SupplierDto[]> {
    return firstValueFrom(this.http.get<SupplierDto[]>(`${environment.apiBaseUrl}/suppliers/all`));
  }
}
