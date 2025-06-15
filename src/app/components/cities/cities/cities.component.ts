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
import { debounceTime, Subject } from 'rxjs';
import {
  AddCityDto,
  FullCity,
  CityDto,
  CityFilterParameters,
  CityPaginationOptions,
  CitySortOptions
} from "../../../models/isp/city.models";
import { CitiesService } from "../../../services/isp/cities.service";

@Component({
  selector: 'app-cities',
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
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.css']
})
export class CitiesComponent implements OnInit {
  displayedColumns: string[] = ['cityName', 'actions'];
  cities: FullCity[] = [];
  totalItems = 0;
  isLoading = false;

  filterForm: FormGroup;
  editForm: FormGroup;
  addForm: FormGroup;

  filter: CityFilterParameters = {};
  sort: CitySortOptions = { ascending: true };
  pagination: CityPaginationOptions = {
    pageSize: 10,
    pageNumber: 0,
    totalItems: 0
  };

  private filterSubject = new Subject<void>();

  editingId: number | null = null;
  isAddingNewRow = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) matSort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<FullCity>;

  constructor(
    private citiesService: CitiesService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      cityNameContains: [null]
    });

    this.editForm = this.fb.group({
      cityName: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.addForm = this.fb.group({
      cityName: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.loadCities();

    this.filterSubject
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.pagination.pageNumber = 0;
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
        this.loadCities();
      });

    this.filterForm.valueChanges.subscribe(() => {
      this.filterSubject.next();
    });
  }

  loadCities(): void {
    this.isLoading = true;

    const filterForm = this.filterForm.value;

    this.filter = {
      cityNameContains: filterForm.cityNameContains
    };

    this.citiesService.getFilteredFull(
      this.filter,
      this.sort,
      this.pagination.pageNumber + 1,
      this.pagination.pageSize
    ).then(result => {
      this.cities = result.items;
      this.totalItems = result.totalCount;
      this.pagination.totalItems = result.totalCount;
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading cities:', error);
      this.isLoading = false;
      alert('Помилка завантаження даних. Спробуйте пізніше.');
    });
  }

  onPageChange(event: PageEvent): void {
    this.pagination.pageSize = event.pageSize;
    this.pagination.pageNumber = event.pageIndex;
    this.loadCities();
  }

  onSortChange(sortState: Sort): void {
    this.sort.sortBy = sortState.active;
    this.sort.ascending = sortState.direction === 'asc';
    this.loadCities();
  }

  startEdit(city: FullCity): void {
    this.editingId = city.id;

    this.editForm.setValue({
      cityName: city.cityName
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editForm.reset({
      cityName: ''
    });
  }

  saveEdit(): void {
    if (this.editForm.invalid) {
      return;
    }

    const formValues = this.editForm.value;
    console.log('Form values before save:', formValues);

    const updatedCity: CityDto = {
      id: this.editingId!,
      cityName: formValues.cityName
    };

    console.log('Saving city:', updatedCity);

    this.isLoading = true;
    this.citiesService.update(updatedCity)
      .then(() => {
        console.log('City updated successfully');
        this.editingId = null;
        this.editForm.reset({
          cityName: ''
        });
        this.loadCities();
      })
      .catch(error => {
        console.error('Error updating city:', error);
        this.isLoading = false;
        alert('Помилка збереження змін. Змініть дані чи спробуйте пізніше.');
      });
  }

  startAddNew(): void {
    this.isAddingNewRow = true;

    this.addForm.reset({
      cityName: ''
    });
  }

  cancelAddNew(): void {
    this.isAddingNewRow = false;

    this.addForm.reset({
      cityName: ''
    });
  }

  saveNewCity(): void {
    if (this.addForm.invalid) {
      return;
    }

    const formValues = this.addForm.value;
    console.log('New city form values:', formValues);

    const newCity: AddCityDto = {
      cityName: formValues.cityName
    };

    console.log('Creating new city:', newCity);

    this.isLoading = true;
    this.citiesService.create(newCity)
      .then(() => {
        console.log('City created successfully');
        this.isAddingNewRow = false;

        this.addForm.reset({
          cityName: ''
        });
        this.loadCities();
      })
      .catch(error => {
        console.error('Error creating city:', error);
        this.isLoading = false;
        alert('Помилка збереження змін. Змініть дані чи спробуйте пізніше.');
      });
  }

  deleteCity(id: number): void {
    if (confirm('Ви впевнені, що хочете видалити це місто?')) {
      this.isLoading = true;
      this.citiesService.delete(id)
        .then(() => {
          console.log('City deleted successfully');
          this.loadCities();
        })
        .catch(error => {
          console.error('Error deleting city:', error);
          this.isLoading = false;
          alert('Помилка видалення міста. Спробуйте пізніше.');
        });
    }
  }

  clearFilters(): void {
    this.filterForm.reset({
      cityNameContains: ''
    });
    this.loadCities();
  }
}