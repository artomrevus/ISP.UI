import { Component } from '@angular/core';
import { MonitoringComponent } from '../../common/monitoring/monitoring.component';
import { HumanResourceHeaderComponent } from '../human-resource-header/human-resource-header.component';

@Component({
  selector: 'app-human-resource-monitoring',
  imports: [
    MonitoringComponent,
    HumanResourceHeaderComponent
  ],
  templateUrl: './human-resource-monitoring.component.html',
  styleUrl: './human-resource-monitoring.component.css'
})
export class HumanResourceMonitoringComponent {

}