import { Component } from '@angular/core';
import {NetworkTechnicianHeaderComponent} from "../network-technician-header/network-technician-header.component";
import {ConnectionListComponent} from "../../connections/connection-list/connection-list.component";

@Component({
  selector: 'app-network-technician-connections',
    imports: [
        NetworkTechnicianHeaderComponent,
        ConnectionListComponent
    ],
  templateUrl: './network-technician-connections.component.html'
})
export class NetworkTechnicianConnectionsComponent {

}
