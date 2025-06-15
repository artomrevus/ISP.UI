import { Component } from '@angular/core';
import { HousesComponent } from "../../houses/houses/houses.component";
import { OfficeManagerHeaderComponent } from "../office-manager-header/office-manager-header.component";

@Component({
  selector: 'app-office-manager-houses',
  imports: [HousesComponent, OfficeManagerHeaderComponent],
  templateUrl: './office-manager-houses.component.html'
})
export class OfficeManagerHousesComponent {

}
