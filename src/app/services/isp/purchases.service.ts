import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {
  AddPurchaseDto, FullPurchase,
  PurchaseDto,
  PurchaseFilterParameters,
  PurchaseSortOptions
} from "../../models/isp/purchase.models";
import {firstValueFrom} from "rxjs";
import {environment} from "../../../environments/environment.development";
import {PurchaseStatusesService} from "./purchase-statuses.service";
import {SuppliersService} from "./suppliers.service";
import {EmployeesService} from "./employees.service";
import {PurchaseEquipmentsService} from "./purchase-equipments.service";

@Injectable({
  providedIn: 'root'
})
export class PurchasesService {

  constructor(
      private http: HttpClient,
      private purchaseStatusesService:  PurchaseStatusesService,
      private suppliersService:  SuppliersService,
      private employeesService: EmployeesService,
      private purchaseEquipmentsService: PurchaseEquipmentsService,
      ) { }

  async get(
      filter: PurchaseFilterParameters,
      sort: PurchaseSortOptions,
      pageNumber: number,
      pageSize: number
  ): Promise<{ items: PurchaseDto[], totalCount: number }> {
    let params = new HttpParams()
        .set('pageNumber', pageNumber.toString())
        .set('pageSize', pageSize.toString());

    if (sort.sortBy) {
      params = params.set('sortBy', sort.sortBy);
      params = params.set('ascending', sort.ascending.toString());
    }

    if (filter.purchaseStatusIds?.length) {
      filter.purchaseStatusIds.forEach(id => {
        params = params.append('purchaseStatusIds', id.toString());
      });
    }

    if (filter.supplierIds?.length) {
      filter.supplierIds.forEach(id => {
        params = params.append('supplierIds', id.toString());
      });
    }

    if (filter.numberContains) {
      params = params.set('numberContains', filter.numberContains);
    }

    if (filter.dateFrom) {
      params = params.set('dateFrom', filter.dateFrom);
    }

    if (filter.dateTo) {
      params = params.set('dateTo', filter.dateTo);
    }

    if (filter.totalPriceFrom !== undefined) {
      params = params.set('totalPriceFrom', filter.totalPriceFrom.toString());
    }

    if (filter.totalPriceTo !== undefined) {
      params = params.set('totalPriceTo', filter.totalPriceTo.toString());
    }

    if (filter.purchaseEquipmentsCountFrom !== undefined) {
      params = params.set('purchaseEquipmentsCountFrom', filter.purchaseEquipmentsCountFrom.toString());
    }

    if (filter.purchaseEquipmentsCountTo !== undefined) {
      params = params.set('purchaseEquipmentsCountTo', filter.purchaseEquipmentsCountTo.toString());
    }

    var items = await firstValueFrom(this.http.get<PurchaseDto[]>(`${environment.apiBaseUrl}/purchases`, { params }));
    var totalCount = await firstValueFrom(this.http.get<number>(`${environment.apiBaseUrl}/purchases/count`, { params }));

    return { items, totalCount}
  }

  getById(id: number): Promise<PurchaseDto> {
    return firstValueFrom(this.http.get<PurchaseDto>(`${environment.apiBaseUrl}/purchases/${id}`));
  }

  create(dto: AddPurchaseDto): Promise<PurchaseDto> {
    return firstValueFrom(this.http.post<PurchaseDto>(`${environment.apiBaseUrl}/purchases`, dto));
  }

  update(dto: PurchaseDto): Promise<PurchaseDto> {
    return firstValueFrom(this.http.put<PurchaseDto>(`${environment.apiBaseUrl}/purchases/${dto.id}`, dto));
  }

  async getFull(
      filter: PurchaseFilterParameters,
      sort: PurchaseSortOptions,
      pageNumber: number,
      pageSize: number
  ): Promise<{ items: FullPurchase[], totalCount: number }> {
    const getResponse = await this.get(filter, sort, pageNumber, pageSize);
    const purchaseDtos = getResponse.items;

    const fullPurchases: FullPurchase[] = [];

    for (const purchaseDto of purchaseDtos) {
      const fullPurchaseStatus = await this.purchaseStatusesService.getByIdFull(purchaseDto.purchaseStatusId);
      const fullSupplier = await this.suppliersService.getByIdFull(purchaseDto.supplierId);
      const fullEmployee = await this.employeesService.getByIdFull(purchaseDto.employeeId);
      const fullPurchaseEquipments = await this.purchaseEquipmentsService.getByPurchaseFull(purchaseDto.id);

      const fullPurchase: FullPurchase = {
        id: purchaseDto.id,
        purchaseStatusId: purchaseDto.purchaseStatusId,
        supplierId: purchaseDto.supplierId,
        employeeId: purchaseDto.employeeId,
        number: purchaseDto.number,
        totalPrice: purchaseDto.totalPrice,
        date: purchaseDto.date,
        purchaseStatus: fullPurchaseStatus,
        supplier: fullSupplier,
        employee: fullEmployee,
        purchaseEquipments: fullPurchaseEquipments
      };

      fullPurchases.push(fullPurchase);
    }

    return {
      items: fullPurchases,
      totalCount: getResponse.totalCount
    };
  }

  async getByIdFull(id: number): Promise<FullPurchase> {
    const purchaseDto = await this.getById(id);

    const fullPurchaseStatus = await this.purchaseStatusesService.getByIdFull(purchaseDto.purchaseStatusId);
    const fullSupplier = await this.suppliersService.getByIdFull(purchaseDto.supplierId);
    const fullEmployee = await this.employeesService.getByIdFull(purchaseDto.employeeId);
    const fullPurchaseEquipments = await this.purchaseEquipmentsService.getByPurchaseFull(purchaseDto.id);

    return {
      id: purchaseDto.id,
      purchaseStatusId: purchaseDto.purchaseStatusId,
      supplierId: purchaseDto.supplierId,
      employeeId: purchaseDto.employeeId,
      number: purchaseDto.number,
      totalPrice: purchaseDto.totalPrice,
      date: purchaseDto.date,
      purchaseStatus: fullPurchaseStatus,
      supplier: fullSupplier,
      employee: fullEmployee,
      purchaseEquipments: fullPurchaseEquipments
    };
  }
}
