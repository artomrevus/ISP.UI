import { Component } from '@angular/core';
import {OfficeManagerHeaderComponent} from "../office-manager-header/office-manager-header.component";
import {PurchaseListComponent} from "../../purchases/purchase-list/purchase-list.component";

@Component({
  selector: 'app-office-manager-purchases',
  imports: [
    OfficeManagerHeaderComponent,
    PurchaseListComponent
  ],
  templateUrl: './office-manager-purchases.component.html',
})
export class OfficeManagerPurchasesComponent {

}
