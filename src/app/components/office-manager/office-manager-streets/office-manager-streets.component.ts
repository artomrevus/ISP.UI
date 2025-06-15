import { Component } from '@angular/core';
import { StreetsComponent } from "../../streets/streets/streets.component";
import { OfficeManagerHeaderComponent } from "../office-manager-header/office-manager-header.component";

@Component({
  selector: 'app-office-manager-streets',
  imports: [StreetsComponent, OfficeManagerHeaderComponent],
  templateUrl: './office-manager-streets.component.html'
})
export class OfficeManagerStreetsComponent {

}
