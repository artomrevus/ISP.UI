import { Component, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginatorModule, PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, Sort, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, Subject } from 'rxjs';
import {
  AddCandidateDto,
  FullCandidate,
  CandidateDto,
  CandidateFilterParameters,
  CandidatePaginationOptions,
  CandidateSortOptions
} from "../../../models/isp/candidate.models";
import { CandidatesService } from "../../../services/isp/candidates.service";

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.css']
})
export class CandidatesComponent implements OnInit {
  displayedColumns: string[] = ['firstName', 'lastName', 'phoneNumber', 'email', 'actions'];
  candidates: WritableSignal<FullCandidate[]> = signal([]);
  totalItems = 0;
  isLoading = false;

  filterForm: FormGroup;
  editForm: FormGroup;
  addForm: FormGroup;

  filter: CandidateFilterParameters = {};
  sort: CandidateSortOptions = { ascending: true };
  pagination: CandidatePaginationOptions = {
    pageSize: 10,
    pageNumber: 0,
    totalItems: 0
  };

  private filterSubject = new Subject<void>();

  editingId: number | null = null;
  isAddingNewRow = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) matSort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<FullCandidate>;

  constructor(
    private candidatesService: CandidatesService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      firstNameContains: [null],
      lastNameContains: [null],
      phoneNumberContains: [null],
      emailContains: [null]
    });

    this.editForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[\+]?[0-9\s\-\(\)]+$/)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.addForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[\+]?[0-9\s\-\(\)]+$/)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.loadCandidates();

    this.filterSubject
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.pagination.pageNumber = 0;
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
        this.loadCandidates();
      });

    this.filterForm.valueChanges.subscribe(() => {
      this.filterSubject.next();
    });
  }

  loadCandidates(): void {
    this.isLoading = true;

    const filterForm = this.filterForm.value;

    this.filter = {
      firstNameContains: filterForm.firstNameContains,
      lastNameContains: filterForm.lastNameContains,
      phoneNumberContains: filterForm.phoneNumberContains,
      emailContains: filterForm.emailContains
    };

    this.candidatesService.getFilteredFull(
      this.filter,
      this.sort,
      this.pagination.pageNumber + 1,
      this.pagination.pageSize
    ).then(result => {
      this.candidates.set(result.items);
      this.totalItems = result.totalCount;
      this.pagination.totalItems = result.totalCount;
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading candidates:', error);
      this.isLoading = false;
      alert('Помилка завантаження даних. Спробуйте пізніше.');
    });
  }

  onPageChange(event: PageEvent): void {
    this.pagination.pageSize = event.pageSize;
    this.pagination.pageNumber = event.pageIndex;
    this.loadCandidates();
  }

  onSortChange(sortState: Sort): void {
    this.sort.sortBy = sortState.active;
    this.sort.ascending = sortState.direction === 'asc';
    this.loadCandidates();
  }

  startEdit(candidate: FullCandidate): void {
    this.editingId = candidate.id;

    this.editForm.setValue({
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      phoneNumber: candidate.phoneNumber,
      email: candidate.email
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editForm.reset({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: ''
    });
  }

  saveEdit(): void {
    if (this.editForm.invalid) {
      return;
    }

    const formValues = this.editForm.value;
    console.log('Form values before save:', formValues);

    const updatedCandidate: CandidateDto = {
      id: this.editingId!,
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      phoneNumber: formValues.phoneNumber,
      email: formValues.email
    };

    console.log('Saving candidate:', updatedCandidate);

    this.isLoading = true;
    this.candidatesService.update(updatedCandidate)
      .then(() => {
        console.log('Candidate updated successfully');
        this.editingId = null;
        this.editForm.reset({
          firstName: '',
          lastName: '',
          phoneNumber: '',
          email: ''
        });
        this.loadCandidates();
      })
      .catch(error => {
        console.error('Error updating candidate:', error);
        this.isLoading = false;
        alert('Помилка збереження змін. Змініть дані чи спробуйте пізніше.');
      });
  }

  startAddNew(): void {
    this.isAddingNewRow = true;

    this.addForm.reset({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: ''
    });
  }

  cancelAddNew(): void {
    this.isAddingNewRow = false;

    this.addForm.reset({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: ''
    });
  }

  saveNewCandidate(): void {
    if (this.addForm.invalid) {
      return;
    }

    const formValues = this.addForm.value;
    console.log('New candidate form values:', formValues);

    const newCandidate: AddCandidateDto = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      phoneNumber: formValues.phoneNumber,
      email: formValues.email
    };

    console.log('Creating new candidate:', newCandidate);

    this.isLoading = true;
    this.candidatesService.create(newCandidate)
      .then(() => {
        console.log('Candidate created successfully');
        this.isAddingNewRow = false;

        this.addForm.reset({
          firstName: '',
          lastName: '',
          phoneNumber: '',
          email: ''
        });
        this.loadCandidates();
      })
      .catch(error => {
        console.error('Error creating candidate:', error);
        this.isLoading = false;
        alert('Помилка збереження змін. Змініть дані чи спробуйте пізніше.');
      });
  }

  deleteCandidate(id: number): void {
    if (confirm('Ви впевнені, що хочете видалити цього кандидата?')) {
      this.isLoading = true;
      this.candidatesService.delete(id)
        .then(() => {
          console.log('Candidate deleted successfully');
          this.loadCandidates();
        })
        .catch(error => {
          console.error('Error deleting candidate:', error);
          this.isLoading = false;
          alert('Помилка видалення кандидата. Спробуйте пізніше.');
        });
    }
  }

  clearFilters(): void {
    this.filterForm.reset({
      firstNameContains: '',
      lastNameContains: '',
      phoneNumberContains: '',
      emailContains: ''
    });
    this.loadCandidates();
  }

  getFullName(candidate: FullCandidate): string {
    return `${candidate.firstName} ${candidate.lastName}`;
  }
}