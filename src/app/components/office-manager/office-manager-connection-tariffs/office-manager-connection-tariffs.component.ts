import { Component } from '@angular/core';
import {OfficeManagerHeaderComponent} from "../office-manager-header/office-manager-header.component";
import {ConnectionTariffsComponent} from "../../connection-tariffs/connection-tariffs/connection-tariffs.component";

@Component({
  selector: 'app-office-manager-connection-tariffs',
  imports: [
    OfficeManagerHeaderComponent,
    ConnectionTariffsComponent
  ],
  templateUrl: './office-manager-connection-tariffs.component.html'
})
export class OfficeManagerConnectionTariffsComponent {

}
