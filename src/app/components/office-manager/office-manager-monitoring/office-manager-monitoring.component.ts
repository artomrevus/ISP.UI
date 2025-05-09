import { Component } from '@angular/core';
import {MonitoringComponent} from "../../common/monitoring/monitoring.component";
import {
    WarehouseWorkerHeaderComponent
} from "../../warehouse-worker/warehouse-worker-header/warehouse-worker-header.component";
import {OfficeManagerHeaderComponent} from "../office-manager-header/office-manager-header.component";

@Component({
  selector: 'app-office-manager-monitoring',
    imports: [
        MonitoringComponent,
        OfficeManagerHeaderComponent
    ],
  templateUrl: './office-manager-monitoring.component.html'
})
export class OfficeManagerMonitoringComponent {

}
