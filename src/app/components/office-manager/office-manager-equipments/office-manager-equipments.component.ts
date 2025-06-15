import { Component } from '@angular/core';
import { OfficeManagerHeaderComponent } from "../office-manager-header/office-manager-header.component";
import { EquipmentsComponent } from "../../equipments/equipments/equipments.component";

@Component({
  selector: 'app-office-manager-equipments',
  imports: [OfficeManagerHeaderComponent, EquipmentsComponent],
  templateUrl: './office-manager-equipments.component.html'
})
export class OfficeManagerEquipmentsComponent {

}
