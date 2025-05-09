import { Component } from '@angular/core';
import {HumanResourceHeaderComponent} from "../../human-resource/human-resource-header/human-resource-header.component";
import {MonitoringComponent} from "../../common/monitoring/monitoring.component";
import {AdminHeaderComponent} from "../admin-header/admin-header.component";

@Component({
  selector: 'app-admin-monitoring',
    imports: [
        MonitoringComponent,
        AdminHeaderComponent
    ],
  templateUrl: './admin-monitoring.component.html',
})
export class AdminMonitoringComponent {

}
