import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import {
  FullPurchase,
  PurchaseFilterParameters,
  PurchaseSortOptions
} from "../../../models/isp/purchase.models";
import {PurchasesService} from "../../../services/isp/purchases.service";
import { PurchaseCardComponent } from '../purchase-card/purchase-card.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {firstValueFrom} from "rxjs";
import {AddPurchaseComponent} from "../add-purchase/add-purchase.component";
import {PurchaseFilterPanelComponent} from "../purchase-filter-panel/purchase-filter-panel.component";
import {AuthEmployeeService} from "../../../services/auth/auth-employee.service";
import {AuthRoles} from "../../../models/auth/auth-roles.model";
import {MonitoringService} from "../../../services/monitoring/monitoring.service";
import {AddUserActivityDto} from "../../../models/monitoring/activity.models";
import {PurchaseStatusesService} from "../../../services/isp/purchase-statuses.service";
import {SuppliersService} from "../../../services/isp/suppliers.service";
import {DateFormatterService} from "../../../services/common/date-formatter.service";

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSidenavModule,
    PurchaseCardComponent,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    PurchaseFilterPanelComponent
  ],
  templateUrl: './purchase-list.component.html',
  styleUrl: './purchase-list.component.css'
})
export class PurchaseListComponent implements OnInit {
  @ViewChild(MatSidenav) sidenav!: MatSidenav;

  purchases: FullPurchase[] = [];
  totalItems = 0;
  pageNumber = 1;
  pageSize = 5;

  isPurchasesLoading = false;
  isFilterPanelOpen = false;

  employeeRole: string = '';
  AuthRoles = AuthRoles;

  filterParams: PurchaseFilterParameters = {
    purchaseStatusIds: [],
    supplierIds: [],
  };

  sortOptions: PurchaseSortOptions = {
    ascending: false
  };

  constructor(
      private purchasesService: PurchasesService,
      private authEmployeeService: AuthEmployeeService,
      private monitoringService: MonitoringService,
      private purchaseStatusesService: PurchaseStatusesService,
      private suppliersService: SuppliersService,
      private dateFormatterService: DateFormatterService,
      private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEmployeeRole();
    this.loadPurchases();
  }

  async loadEmployeeRole() {
    const login = this.authEmployeeService.getLogin();
    if (login) {
      this.employeeRole = login.role;
    }
  }

  async loadPurchases() {
    this.isPurchasesLoading = true;

    this.purchases = [];

    const response = await this.purchasesService.getFull(
        this.filterParams,
        this.sortOptions,
        this.pageNumber,
        this.pageSize);

    this.purchases = response.items;
    this.totalItems = response.totalCount;

    this.isPurchasesLoading = false;

    // Log activity
    const activity: AddUserActivityDto = {
      actionOn: 'Закупки',
      action: 'Отримання',
      details: await this.formatGetActivityDetails(this.filterParams, this.sortOptions, this.pageNumber, this.pageSize)
    };

    await firstValueFrom(this.monitoringService.logActivity(activity));
  }
  onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadPurchases();
  }

  onFiltersChanged(filterData: {filters: PurchaseFilterParameters, sorting: PurchaseSortOptions}): void {
    this.filterParams = filterData.filters;
    this.sortOptions = filterData.sorting;

    this.pageNumber = 1;
    this.loadPurchases();
  }

  toggleFilterPanel(): void {
    this.isFilterPanelOpen = !this.isFilterPanelOpen;
  }

  closeFilterPanel(): void {
    this.isFilterPanelOpen = false;
  }

  async openAddPurchaseDialog() {
    const dialogRef = this.dialog.open(AddPurchaseComponent, {
      width: '600px',
      maxWidth: '95vw',
      panelClass: 'purchase-dialog',
      disableClose: true
    });

    const createdPurchaseId = await firstValueFrom(dialogRef.afterClosed());
    if (createdPurchaseId) {
      this.loadPurchases();
    }
  }


  // ---------------------------------
  //
  // Monitoring methods
  //
  // ---------------------------------


  async formatGetActivityDetails(
      filterParams: PurchaseFilterParameters,
      sortOptions: PurchaseSortOptions,
      pageNumber: number,
      pageSize: number): Promise<string>
  {
    let details = '';
    details += `Номер сторінки: ${pageNumber}.\nРозмір сторінки: ${pageSize}.\n`

    if (sortOptions.sortBy){
      details += `Сортування по: ${this.getSortingName(sortOptions.sortBy)}.\nСортування за: ${(sortOptions.ascending ? 'Зростанням' : 'Спаданням')}.\n`
    } else {
      details += 'Сортування: Не застосовувалося.\n'
    }

    details += 'Фільтрація:'

    let isFiltersApplied = false;
    if (filterParams.purchaseStatusIds && filterParams.purchaseStatusIds.length > 0) {

      if (!isFiltersApplied){
        details += '\n'
      }

      const purchaseStatuses = await this.purchaseStatusesService.get();
      const purchaseStatusNames = filterParams.purchaseStatusIds.map((id: number) => {
        const purchaseStatus = purchaseStatuses.find(x => x.id === id);
        return `${purchaseStatus?.purchaseStatusName}`;
      });

      details += ` - Статуси закупок: ${purchaseStatusNames.join(', ')}.\n`;
      isFiltersApplied = true;
    }

    if (filterParams.supplierIds && filterParams.supplierIds.length > 0) {

      if (!isFiltersApplied){
        details += '\n'
      }

      const supplierStatuses = await this.suppliersService.get();
      const supplierNames = filterParams.supplierIds.map((id: number) => {
        const supplier = supplierStatuses.find(c => c.id === id);
        return `${supplier?.name}`;
      });

      details += ` - Постачальники: ${supplierNames.join(', ')}.\n`;
      isFiltersApplied = true;
    }

    if (filterParams.numberContains) {

      if (!isFiltersApplied){
        details += '\n'
      }

      details += ` - Номер вакансії: ${filterParams.numberContains}.\n`;
      isFiltersApplied = true;
    }

    if (filterParams.dateFrom) {

      if (!isFiltersApplied){
        details += '\n'
      }

      details += ` - Дата закупки від: ${filterParams.dateFrom}.\n`;
      isFiltersApplied = true;
    }

    if (filterParams.dateTo) {

      if (!isFiltersApplied){
        details += '\n'
      }

      details += ` - Дата закупки до: ${filterParams.dateTo}.\n`;
      isFiltersApplied = true;
    }

    if (filterParams.totalPriceFrom) {

      if (!isFiltersApplied){
        details += '\n'
      }

      details += ` - Ціна закупки від: ${filterParams.totalPriceFrom}.\n`;
      isFiltersApplied = true;
    }

    if (filterParams.totalPriceTo) {

      if (!isFiltersApplied){
        details += '\n'
      }

      details += ` - Ціна закупки до: ${filterParams.totalPriceTo}.\n`;
      isFiltersApplied = true;
    }

    if (filterParams.purchaseEquipmentsCountFrom) {

      if (!isFiltersApplied){
        details += '\n'
      }

      details += ` - Кількість обладнання в закупці від: ${filterParams.purchaseEquipmentsCountFrom}.\n`;
      isFiltersApplied = true;
    }

    if (filterParams.purchaseEquipmentsCountTo) {

      if (!isFiltersApplied){
        details += '\n'
      }

      details += ` - Кількість обладнання в закупці до: ${filterParams.purchaseEquipmentsCountTo}.\n`;
      isFiltersApplied = true;
    }

    if (!isFiltersApplied){
      details += ' Не застосовувалася.\n'
    }

    return details;
  }

  getSortingName(sortBy: string | undefined) {
    switch (sortBy) {
      case 'purchaseDate':
        return 'Даті закупки'
      case 'purchaseTotalPrice':
        return 'Ціні закупки'
      case 'purchaseEquipmentsCount':
        return "Кількості обладнання в закупці"
      default:
        return '';
    }
  }


  // ---------------------------------
  //
  // Export methods
  //
  // ---------------------------------


  async exportAsJson() {
    let exportPurchases: any[] = [];

    for (const purchase of this.purchases) {

      const exportPurchaseEquipments: any[] = [];
      if (purchase.purchaseEquipments) {
        for (const purchaseEquipment of purchase.purchaseEquipments) {

          const exportEquipmentPlacements: any[] = [];
          if (purchaseEquipment.equipmentPlacements){
            for (const equipmentPlacement of purchaseEquipment.equipmentPlacements) {
              exportEquipmentPlacements.push({
                date: equipmentPlacement.date,
                amount: equipmentPlacement.equipmentPlacementAmount,
                employee: {
                  firstName: equipmentPlacement.employee?.firstName,
                  lastName: equipmentPlacement.employee?.lastName,
                },
                office: {
                  address: equipmentPlacement.officeEquipment?.office.address,
                  city: equipmentPlacement.officeEquipment?.office.city.cityName,
                }
              });
            }
          }

          exportPurchaseEquipments.push({
            name: purchaseEquipment.equipment?.name,
            amount: purchaseEquipment.purchaseEquipmentAmount,
            price: purchaseEquipment.price,
            placements: exportEquipmentPlacements
          });
        }
      }

      const exportPurchase = {
        number: purchase.number,
        status: purchase.purchaseStatus?.purchaseStatusName,
        date: purchase.date,
        totalPrice: purchase.totalPrice,
        supplier: purchase.supplier?.name,
        employee: {
          firstName: purchase.employee?.firstName,
          lastName: purchase.employee?.lastName,
        },
        equipments: exportPurchaseEquipments
      }

      exportPurchases.push(exportPurchase);
    }

    const jsonString = JSON.stringify(exportPurchases, null, 2);
    console.log(jsonString)
    const blob = new Blob([jsonString], { type: 'application/json' });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchases-${this.dateFormatterService.formatDate(new Date())}.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);
  }
}