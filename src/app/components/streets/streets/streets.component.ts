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
  AddStreetDto,
  FullStreet,
  StreetDto,
  StreetFilterParameters,
  StreetPaginationOptions,
  StreetSortOptions
} from "../../../models/isp/street.models";
import { StreetsService } from "../../../services/isp/streets.service";
import { CitiesService } from "../../../services/isp/cities.service";
import { FullCity } from '../../../models/isp/city.models';

@Component({
  selector: 'app-streets',
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
  templateUrl: './streets.component.html',
  styleUrls: ['./streets.component.css']
})
export class StreetsComponent implements OnInit {
  displayedColumns: string[] = ['streetName', 'city', 'actions'];
  streets: FullStreet[] = [];
  totalItems = 0;
  isLoading = false;

  filterForm: FormGroup;
  editForm: FormGroup;
  addForm: FormGroup;

  filter: StreetFilterParameters = {
    cityIds: []
  };
  sort: StreetSortOptions = { ascending: true };
  pagination: StreetPaginationOptions = {
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
  @ViewChild(MatTable) table!: MatTable<FullStreet>;

  constructor(
    private streetsService: StreetsService,
    private citiesService: CitiesService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      streetNameContains: [null],
      cityIds: [[]]
    });

    this.editForm = this.fb.group({
      streetName: ['', [Validators.required, Validators.minLength(2)]],
      cityId: [null, Validators.required]
    });

    this.addForm = this.fb.group({
      streetName: ['', [Validators.required, Validators.minLength(2)]],
      cityId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadStreets();
    this.loadCities();

    this.filterSubject
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.pagination.pageNumber = 0;
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
        this.loadStreets();
      });

    this.filterForm.valueChanges.subscribe(() => {
      this.filterSubject.next();
    });
  }

  loadStreets(): void {
    this.isLoading = true;

    const filterForm = this.filterForm.value;

    this.filter = {
      streetNameContains: filterForm.streetNameContains,
      cityIds: filterForm.cityIds || []
    };

    this.streetsService.getFilteredFull(
      this.filter,
      this.sort,
      this.pagination.pageNumber + 1,
      this.pagination.pageSize
    ).then(result => {
      this.streets = result.items;
      this.totalItems = result.totalCount;
      this.pagination.totalItems = result.totalCount;
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading streets:', error);
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
    this.loadStreets();
  }

  onSortChange(sortState: Sort): void {
    this.sort.sortBy = sortState.active;
    this.sort.ascending = sortState.direction === 'asc';
    this.loadStreets();
  }

  startEdit(street: FullStreet): void {
    this.editingId = street.id;

    this.editForm.setValue({
      streetName: street.streetName,
      cityId: street.cityId
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editForm.reset({
      streetName: '',
      cityId: null
    });
  }

  saveEdit(): void {
    if (this.editForm.invalid) {
      return;
    }

    const formValues = this.editForm.value;
    console.log('Form values before save:', formValues);

    const updatedStreet: StreetDto = {
      id: this.editingId!,
      streetName: formValues.streetName,
      cityId: formValues.cityId
    };

    console.log('Saving street:', updatedStreet);

    this.isLoading = true;
    this.streetsService.update(updatedStreet)
      .then(() => {
        console.log('Street updated successfully');
        this.editingId = null;
        this.editForm.reset({
          streetName: '',
          cityId: null
        });
        this.loadStreets();
      })
      .catch(error => {
        console.error('Error updating street:', error);
        this.isLoading = false;
        alert('Помилка збереження змін. Змініть дані чи спробуйте пізніше.');
      });
  }

  startAddNew(): void {
    this.isAddingNewRow = true;

    this.addForm.reset({
      streetName: '',
      cityId: null
    });
  }

  cancelAddNew(): void {
    this.isAddingNewRow = false;

    this.addForm.reset({
      streetName: '',
      cityId: null
    });
  }

  saveNewStreet(): void {
    if (this.addForm.invalid) {
      return;
    }

    const formValues = this.addForm.value;
    console.log('New street form values:', formValues);

    const newStreet: AddStreetDto = {
      streetName: formValues.streetName,
      cityId: formValues.cityId
    };

    console.log('Creating new street:', newStreet);

    this.isLoading = true;
    this.streetsService.create(newStreet)
      .then(() => {
        console.log('Street created successfully');
        this.isAddingNewRow = false;

        this.addForm.reset({
          streetName: '',
          cityId: null
        });
        this.loadStreets();
      })
      .catch(error => {
        console.error('Error creating street:', error);
        this.isLoading = false;
        alert('Помилка збереження змін. Змініть дані чи спробуйте пізніше.');
      });
  }

  deleteStreet(id: number): void {
    if (confirm('Ви впевнені, що хочете видалити цю вулицю?')) {
      this.isLoading = true;
      this.streetsService.delete(id)
        .then(() => {
          console.log('Street deleted successfully');
          this.loadStreets();
        })
        .catch(error => {
          console.error('Error deleting street:', error);
          this.isLoading = false;
          alert('Помилка видалення вулиці. Спробуйте пізніше.');
        });
    }
  }

  clearFilters(): void {
    this.filterForm.reset({
      streetNameContains: '',
      cityIds: []
    });
    this.loadStreets();
  }
}