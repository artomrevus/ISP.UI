import { Component } from '@angular/core';
import { ClientsComponent } from "../../clients/clients/clients.component";
import { OfficeManagerHeaderComponent } from "../office-manager-header/office-manager-header.component";

@Component({
  selector: 'app-office-manager-clients',
  imports: [ClientsComponent, OfficeManagerHeaderComponent],
  templateUrl: './office-manager-clients.component.html'
})
export class OfficeManagerClientsComponent {

}
