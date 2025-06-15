import { Component } from '@angular/core';
import { OfficesComponent } from "../../offices/offices/offices.component";
import { OfficeManagerHeaderComponent } from "../office-manager-header/office-manager-header.component";

@Component({
  selector: 'app-office-manager-offices',
  imports: [OfficesComponent, OfficeManagerHeaderComponent],
  templateUrl: './office-manager-offices.component.html'
})
export class OfficeManagerOfficesComponent {

}
