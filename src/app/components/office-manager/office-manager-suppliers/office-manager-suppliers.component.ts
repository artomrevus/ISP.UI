import { Component } from '@angular/core';
import {OfficeManagerHeaderComponent} from "../office-manager-header/office-manager-header.component";
import {PurchaseListComponent} from "../../purchases/purchase-list/purchase-list.component";
import {SupplierTableComponent} from "../../suppliers/supplier-table/supplier-table.component";

@Component({
  selector: 'app-office-manager-suppliers',
    imports: [
        OfficeManagerHeaderComponent,
        SupplierTableComponent
    ],
  templateUrl: './office-manager-suppliers.component.html'
})
export class OfficeManagerSuppliersComponent {

}
