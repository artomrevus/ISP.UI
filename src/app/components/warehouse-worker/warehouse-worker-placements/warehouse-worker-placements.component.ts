import { Component } from '@angular/core';
import {WarehouseWorkerHeaderComponent} from "../warehouse-worker-header/warehouse-worker-header.component";
import {PurchaseListComponent} from "../../purchases/purchase-list/purchase-list.component";

@Component({
  selector: 'app-warehouse-worker-placements',
  imports: [
    WarehouseWorkerHeaderComponent,
    PurchaseListComponent
  ],
  templateUrl: './warehouse-worker-placements.component.html'
})
export class WarehouseWorkerPlacementsComponent {

}
