import { Component } from '@angular/core';
import { CandidatesComponent } from "../../candidates/candidates/candidates.component";
import { HumanResourceHeaderComponent } from "../human-resource-header/human-resource-header.component";

@Component({
  selector: 'app-human-resource-candidates',
  imports: [CandidatesComponent, HumanResourceHeaderComponent],
  templateUrl: './human-resource-candidates.component.html'
})
export class HumanResourceCandidatesComponent {

}
