import { Component } from '@angular/core';
import { OfficeManagerHeaderComponent } from "../office-manager-header/office-manager-header.component";
import { CitiesComponent } from "../../cities/cities/cities.component";

@Component({
  selector: 'app-office-manager-cities',
  imports: [OfficeManagerHeaderComponent, CitiesComponent],
  templateUrl: './office-manager-cities.component.html'
})
export class OfficeManagerCitiesComponent {

}
