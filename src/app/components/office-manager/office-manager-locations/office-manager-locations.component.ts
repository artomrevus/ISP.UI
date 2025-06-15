import { Component } from '@angular/core';
import { OfficeManagerHeaderComponent } from "../office-manager-header/office-manager-header.component";
import { LocationsComponent } from "../../locations/locations/locations.component";

@Component({
  selector: 'app-office-manager-locations',
  imports: [OfficeManagerHeaderComponent, LocationsComponent],
  templateUrl: './office-manager-locations.component.html'
})
export class OfficeManagerLocationsComponent {

}
