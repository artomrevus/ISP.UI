import { Component, OnInit, ViewChild } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, Subject } from 'rxjs';
import {
  AddOfficeDto,
  FullOffice,
  OfficeDto,
  OfficeFilterParameters,
  OfficePaginationOptions,
  OfficeSortOptions
} from "../../../models/isp/office.models";
import { OfficesService } from "../../../services/isp/offices.service";
import { CitiesService } from "../../../services/isp/cities.service";
import { FullCity } from '../../../models/isp/city.models';

@Component({
  selector: 'app-offices',
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
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  templateUrl: './offices.component.html',
  styleUrls: ['./offices.component.css']
})
export class OfficesComponent implements OnInit {
  displayedColumns: string[] = ['address', 'phoneNumber', 'email', 'city', 'actions'];
  offices: FullOffice[] = [];
  totalItems = 0;
  isLoading = false;

  filterForm: FormGroup;
  editForm: FormGroup;
  addForm: FormGroup;

  filter: OfficeFilterParameters = {
    cityIds: []
  };
  sort: OfficeSortOptions = { ascending: true };
  pagination: OfficePaginationOptions = {
    pageSize: 10,
    pageNumber: 0,
    totalItems: 0
  };

  private filterSubject = new Subject<void>();

  editingId: number | null = null;
  isAddingNewRow = false;

  cities: FullCity[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) matSort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<FullOffice>;

  constructor(
    private officesService: OfficesService,
    private citiesService: CitiesService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      addressContains: [null],
      phoneNumberContains: [null],
      emailContains: [null],
      cityIds: [[]]
    });

    this.editForm = this.fb.group({
      address: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[\+]?[0-9\s\-\(\)]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      cityId: [null, Validators.required]
    });

    this.addForm = this.fb.group({
      address: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[\+]?[0-9\s\-\(\)]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      cityId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadOffices();
    this.loadCities();

    this.filterSubject
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.pagination.pageNumber = 0;
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
        this.loadOffices();
      });

    this.filterForm.valueChanges.subscribe(() => {
      this.filterSubject.next();
    });
  }

  loadOffices(): void {
    this.isLoading = true;

    const filterForm = this.filterForm.value;

    this.filter = {
      addressContains: filterForm.addressContains,
      phoneNumberContains: filterForm.phoneNumberContains,
      emailContains: filterForm.emailContains,
      cityIds: filterForm.cityIds || []
    };

    this.officesService.getFilteredFull(
      this.filter,
      this.sort,
      this.pagination.pageNumber + 1,
      this.pagination.pageSize
    ).then(result => {
      this.offices = result.items;
      this.totalItems = result.totalCount;
      this.pagination.totalItems = result.totalCount;
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading offices:', error);
      this.isLoading = false;
      alert('Помилка завантаження даних. Спробуйте пізніше.');
    });
  }

  async loadCities() {
    this.cities = await this.citiesService.get();
  }

  onPageChange(event: PageEvent): void {
    this.pagination.pageSize = event.pageSize;
    this.pagination.pageNumber = event.pageIndex;
    this.loadOffices();
  }

  onSortChange(sortState: Sort): void {
    this.sort.sortBy = sortState.active;
    this.sort.ascending = sortState.direction === 'asc';
    this.loadOffices();
  }

  startEdit(office: FullOffice): void {
    this.editingId = office.id;

    this.editForm.setValue({
      address: office.address,
      phoneNumber: office.phoneNumber,
      email: office.email,
      cityId: office.cityId
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editForm.reset({
      address: '',
      phoneNumber: '',
      email: '',
      cityId: null
    });
  }

  saveEdit(): void {
    if (this.editForm.invalid) {
      return;
    }

    const formValues = this.editForm.value;
    console.log('Form values before save:', formValues);

    const updatedOffice: OfficeDto = {
      id: this.editingId!,
      address: formValues.address,
      phoneNumber: formValues.phoneNumber,
      email: formValues.email,
      cityId: formValues.cityId
    };

    console.log('Saving office:', updatedOffice);

    this.isLoading = true;
    this.officesService.update(updatedOffice)
      .then(() => {
        console.log('Office updated successfully');
        this.editingId = null;
        this.editForm.reset({
          address: '',
          phoneNumber: '',
          email: '',
          cityId: null
        });
        this.loadOffices();
      })
      .catch(error => {
        console.error('Error updating office:', error);
        this.isLoading = false;
        alert('Помилка збереження змін. Змініть дані чи спробуйте пізніше.');
      });
  }

  startAddNew(): void {
    this.isAddingNewRow = true;

    this.addForm.reset({
      address: '',
      phoneNumber: '',
      email: '',
      cityId: null
    });
  }

  cancelAddNew(): void {
    this.isAddingNewRow = false;

    this.addForm.reset({
      address: '',
      phoneNumber: '',
      email: '',
      cityId: null
    });
  }

  saveNewOffice(): void {
    if (this.addForm.invalid) {
      return;
    }

    const formValues = this.addForm.value;
    console.log('New office form values:', formValues);

    const newOffice: AddOfficeDto = {
      address: formValues.address,
      phoneNumber: formValues.phoneNumber,
      email: formValues.email,
      cityId: formValues.cityId
    };

    console.log('Creating new office:', newOffice);

    this.isLoading = true;
    this.officesService.create(newOffice)
      .then(() => {
        console.log('Office created successfully');
        this.isAddingNewRow = false;

        this.addForm.reset({
          address: '',
          phoneNumber: '',
          email: '',
          cityId: null
        });
        this.loadOffices();
      })
      .catch(error => {
        console.error('Error creating office:', error);
        this.isLoading = false;
        alert('Помилка збереження змін. Змініть дані чи спробуйте пізніше.');
      });
  }

  deleteOffice(id: number): void {
    if (confirm('Ви впевнені, що хочете видалити цей офіс?')) {
      this.isLoading = true;
      this.officesService.delete(id)
        .then(() => {
          console.log('Office deleted successfully');
          this.loadOffices();
        })
        .catch(error => {
          console.error('Error deleting office:', error);
          this.isLoading = false;
          alert('Помилка видалення офісу. Спробуйте пізніше.');
        });
    }
  }

  clearFilters(): void {
    this.filterForm.reset({
      addressContains: '',
      phoneNumberContains: '',
      emailContains: '',
      cityIds: []
    });
    this.loadOffices();
  }
}