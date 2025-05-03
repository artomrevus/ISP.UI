import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {PurchaseDto, PurchaseFilterParameters, PurchaseSortOptions} from "../../../models/isp/purchase.models";
import {PurchasesService} from "../../../services/isp/purchases.service";
import { PurchaseCardComponent } from '../purchase-card/purchase-card.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

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
    PurchaseCardComponent,
    //MatFormField,
    //MatLabel,
    //MatSelect,
    //MatOption,
    MatButtonToggleModule
    //FiltersComponent,
  ],
  templateUrl: './purchase-list.component.html',
  styleUrl: './purchase-list.component.css'
})
export class PurchaseListComponent implements OnInit {
  purchases: PurchaseDto[] = [];
  totalItems = 0;
  pageNumber = 1;
  pageSize = 10;

  filterParams: PurchaseFilterParameters = {
    purchaseStatusIds: [],
    supplierIds: [],
  };

  sortOptions: PurchaseSortOptions = {
    ascending: false
  };

  constructor(
      private purchasesService: PurchasesService,
      private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPurchases();
  }

  async loadPurchases(): Promise<void> {
    const response = await this.purchasesService.get(
        this.filterParams,
        this.sortOptions,
        this.pageNumber,
        this.pageSize);

    this.purchases = response.items;
    this.totalItems = response.totalCount;
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadPurchases();
  }

  onFilterChange(filter: PurchaseFilterParameters): void {
    this.filterParams = filter;
    this.pageNumber = 1;
    this.loadPurchases();
  }

  onSortChange(): void {
    this.loadPurchases();
  }

  async onStatusChange(data: { purchaseId: number, newStatusId: number }): Promise<void> {
    let purchase = this.purchases.find(x => x.id == data.purchaseId);

    if (!purchase) {
      console.error('Purchase not found.');
      return;
    }

    purchase.purchaseStatusId = data.newStatusId;

    await this.purchasesService.update(purchase);
    this.loadPurchases();
  }

   openAddPurchaseDialog(): void {
  //   const dialogRef = this.dialog.open(AddPurchaseComponent, {
  //     width: '600px'
  //   });
  //
  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       this.loadPurchases();
  //     }
  //   });
   }
}