import { Injectable } from '@angular/core';
import { EquipmentTypeDto, FullEquipmentType } from '../../models/isp/equipment-type.models';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class EquipmentTypesService {

  constructor(
    private http: HttpClient) {
  }

  getById(id: number): Observable<EquipmentTypeDto> {
    return this.http.get<EquipmentTypeDto>(`${environment.apiBaseUrl}/equipmenttypes/${id}`);
  }

  get(): Promise<EquipmentTypeDto[]> {
    return firstValueFrom(this.http.get<EquipmentTypeDto[]>(`${environment.apiBaseUrl}/equipmenttypes/all`));
  }

  getByIdFull(id: number): Promise<FullEquipmentType> {
    return firstValueFrom(this.getById(id));
  }
}
