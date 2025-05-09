import { Component } from '@angular/core';
import {HumanResourceHeaderComponent} from "../human-resource-header/human-resource-header.component";
import {VacancyListComponent} from "../../vacancies/vacancy-list/vacancy-list.component";

@Component({
  selector: 'app-human-resource-vacancies',
  imports: [
    HumanResourceHeaderComponent,
    VacancyListComponent
  ],
  templateUrl: './human-resource-vacancies.component.html',
})
export class HumanResourceVacanciesComponent {

}
