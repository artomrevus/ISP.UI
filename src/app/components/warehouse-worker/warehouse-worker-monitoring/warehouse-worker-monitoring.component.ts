import { Component } from '@angular/core';
import {MonitoringComponent} from "../../common/monitoring/monitoring.component";
import {
    NetworkTechnicianHeaderComponent
} from "../../network-technician/network-technician-header/network-technician-header.component";
import {WarehouseWorkerHeaderComponent} from "../warehouse-worker-header/warehouse-worker-header.component";

@Component({
  selector: 'app-warehouse-worker-monitoring',
    imports: [
        MonitoringComponent,
        WarehouseWorkerHeaderComponent
    ],
  templateUrl: './warehouse-worker-monitoring.component.html'
})
export class WarehouseWorkerMonitoringComponent {

}
