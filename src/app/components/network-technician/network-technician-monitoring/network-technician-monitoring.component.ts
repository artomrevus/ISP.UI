import { Component } from '@angular/core';
import { MonitoringComponent } from '../../common/monitoring/monitoring.component';
import { NetworkTechnicianHeaderComponent } from '../network-technician-header/network-technician-header.component';

@Component({
  selector: 'app-network-technician-monitoring',
  imports: [
    MonitoringComponent,
    NetworkTechnicianHeaderComponent
  ],
  templateUrl: './network-technician-monitoring.component.html',
  styleUrl: './network-technician-monitoring.component.css'
})
export class NetworkTechnicianMonitoringComponent {

}
