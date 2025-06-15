import { Component } from '@angular/core';
import { OfficeManagerHeaderComponent } from '../office-manager-header/office-manager-header.component';
import { InternetTariffsComponent } from '../../internet-tariffs/internet-tariffs.component';

@Component({
  selector: 'app-office-manager-internet-tariffs',
   imports: [
    OfficeManagerHeaderComponent,
    InternetTariffsComponent
  ],
  templateUrl: './office-manager-internet-tariffs.component.html'
})
export class OfficeManagerInternetTariffsComponent {

}