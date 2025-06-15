import { Injectable } from '@angular/core';
import { AddEquipmentDto, EquipmentDto, EquipmentFilterParameters, EquipmentSortOptions, FullEquipment } from '../../models/isp/equipment.models';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  async getFiltered(
    filter: EquipmentFilterParameters,
    sort: EquipmentSortOptions,
    pageNumber: number,
    pageSize: number
  ): Promise<{ items: EquipmentDto[]; totalCount: number; }> {

    let params = this.convertToHttpParams(filter)
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (sort.sortBy) {
      params = params.set('sortBy', sort.sortBy);
      params = params.set('ascending', sort.ascending.toString());
    }

    var items = await firstValueFrom(this.http.get<EquipmentDto[]>(`${environment.apiBaseUrl}/equipments`, { params }));
    var totalCount = await firstValueFrom(this.http.get<number>(`${environment.apiBaseUrl}/equipments/count`, { params }));

    return { items, totalCount };
  }

  async update(dto: EquipmentDto): Promise<EquipmentDto> {
    return firstValueFrom(this.http.put<EquipmentDto>(`${environment.apiBaseUrl}/equipments/${dto.id}`, dto));
  }

  async create(dto: AddEquipmentDto): Promise<EquipmentDto> {
    return firstValueFrom(this.http.post<EquipmentDto>(`${environment.apiBaseUrl}/equipments`, dto));
  }

  async delete(id: number) {
    return firstValueFrom(this.http.delete<{}>(`${environment.apiBaseUrl}/equipments/${id}`));
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
    for (const equipmentDto of equipmentDtos) {
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

  async getFilteredFull(
    filter: EquipmentFilterParameters,
    sort: EquipmentSortOptions,
    pageNumber: number,
    pageSize: number
  ): Promise<{ items: FullEquipment[]; totalCount: number; }> {
    const filterResult = await this.getFiltered(filter, sort, pageNumber, pageSize);
    const equipmentDtos = filterResult.items;

    const fullEquipments: FullEquipment[] = [];
    for (const equipmentDto of equipmentDtos) {
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

    return {
      items: fullEquipments,
      totalCount: filterResult.totalCount,
    };
  }

  private convertToHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      const value = params[key];
      if (Array.isArray(value)) {
        value.forEach(item => {
          httpParams = httpParams.append(`${key}`, item);
        });
      } else if (value) {
        httpParams = httpParams.append(key, value);
      }
    });

    return httpParams;
  }
}
