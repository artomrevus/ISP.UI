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
  AddHouseDto,
  FullHouse,
  HouseDto,
  HouseFilterParameters,
  HousePaginationOptions,
  HouseSortOptions
} from "../../../models/isp/house.models";
import { HousesService } from "../../../services/isp/houses.service";
import { StreetsService } from "../../../services/isp/streets.service";
import { CitiesService } from "../../../services/isp/cities.service";
import { FullCity } from '../../../models/isp/city.models';
import { FullStreet } from '../../../models/isp/street.models';

@Component({
  selector: 'app-houses',
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
  templateUrl: './houses.component.html',
  styleUrls: ['./houses.component.css']
})
export class HousesComponent implements OnInit {
  displayedColumns: string[] = ['houseNumber', 'street', 'city', 'actions'];
  houses: FullHouse[] = [];
  totalItems = 0;
  isLoading = false;

  filterForm: FormGroup;
  editForm: FormGroup;
  addForm: FormGroup;

  filter: HouseFilterParameters = {
    streetIds: 0,
    cityIds: 0,
    houseNumberContains: ''
  };
  sort: HouseSortOptions = { ascending: true };
  pagination: HousePaginationOptions = {
    pageSize: 10,
    pageNumber: 0,
    totalItems: 0
  };

  private filterSubject = new Subject<void>();

  editingId: number | null = null;
  isAddingNewRow = false;

  cities: FullCity[] = [];
  streets: FullStreet[] = [];
  filteredStreetsForEdit: FullStreet[] = [];
  filteredStreetsForAdd: FullStreet[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) matSort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<FullHouse>;

  constructor(
    private housesService: HousesService,
    private streetsService: StreetsService,
    private citiesService: CitiesService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      houseNumberContains: [null],
      cityIds: [null],
      streetIds: [null]
    });

    this.editForm = this.fb.group({
      houseNumber: ['', [Validators.required, Validators.minLength(1)]],
      cityId: [null, Validators.required],
      streetId: [null, Validators.required]
    });

    this.addForm = this.fb.group({
      houseNumber: ['', [Validators.required, Validators.minLength(1)]],
      cityId: [null, Validators.required],
      streetId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadHouses();
    this.loadCities();
    this.loadStreets();

    this.filterSubject
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.pagination.pageNumber = 0;
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
        this.loadHouses();
      });

    this.filterForm.valueChanges.subscribe(() => {
      this.filterSubject.next();
    });

    // Watch for city changes in edit form
    this.editForm.get('cityId')?.valueChanges.subscribe(cityId => {
      this.onEditCityChange(cityId);
    });

    // Watch for city changes in add form
    this.addForm.get('cityId')?.valueChanges.subscribe(cityId => {
      this.onAddCityChange(cityId);
    });
  }

  loadHouses(): void {
    this.isLoading = true;

    const filterForm = this.filterForm.value;

    this.filter = {
      houseNumberContains: filterForm.houseNumberContains || '',
      cityIds: filterForm.cityIds || 0,
      streetIds: filterForm.streetIds || 0
    };

    this.housesService.getFilteredFull(
      this.filter,
      this.sort,
      this.pagination.pageNumber + 1,
      this.pagination.pageSize
    ).then(result => {
      this.houses = result.items;
      this.totalItems = result.totalCount;
      this.pagination.totalItems = result.totalCount;
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading houses:', error);
      this.isLoading = false;
      alert('Помилка завантаження даних. Спробуйте пізніше.');
    });
  }

  async loadCities() {
    this.cities = await this.citiesService.get();
  }

  async loadStreets() {
    this.streets = await this.streetsService.getFull();
  }

  onEditCityChange(cityId: number): void {
    if (cityId) {
      this.filteredStreetsForEdit = this.streets.filter(street => street.cityId === cityId);
      // Reset street selection when city changes
      this.editForm.patchValue({ streetId: null });
    } else {
      this.filteredStreetsForEdit = [];
    }
  }

  onAddCityChange(cityId: number): void {
    if (cityId) {
      this.filteredStreetsForAdd = this.streets.filter(street => street.cityId === cityId);
      // Reset street selection when city changes
      this.addForm.patchValue({ streetId: null });
    } else {
      this.filteredStreetsForAdd = [];
    }
  }

  onPageChange(event: PageEvent): void {
    this.pagination.pageSize = event.pageSize;
    this.pagination.pageNumber = event.pageIndex;
    this.loadHouses();
  }

  onSortChange(sortState: Sort): void {
    this.sort.sortBy = sortState.active;
    this.sort.ascending = sortState.direction === 'asc';
    this.loadHouses();
  }

  startEdit(house: FullHouse): void {
    this.editingId = house.id;

    // Set city first to populate streets
    const cityId = house.street?.cityId;
    this.editForm.patchValue({
      cityId: cityId,
      houseNumber: house.houseNumber
    });

    // Filter streets for the selected city
    if (cityId) {
      this.filteredStreetsForEdit = this.streets.filter(street => street.cityId === cityId);
    }

    // Then set the street
    this.editForm.patchValue({
      streetId: house.streetId
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.filteredStreetsForEdit = [];
    this.editForm.reset({
      houseNumber: '',
      cityId: null,
      streetId: null
    });
  }

  saveEdit(): void {
    if (this.editForm.invalid) {
      return;
    }

    const formValues = this.editForm.value;
    console.log('Form values before save:', formValues);

    const updatedHouse: HouseDto = {
      id: this.editingId!,
      houseNumber: formValues.houseNumber,
      streetId: formValues.streetId
    };

    console.log('Saving house:', updatedHouse);

    this.isLoading = true;
    this.housesService.update(updatedHouse)
      .then(() => {
        console.log('House updated successfully');
        this.editingId = null;
        this.filteredStreetsForEdit = [];
        this.editForm.reset({
          houseNumber: '',
          cityId: null,
          streetId: null
        });
        this.loadHouses();
      })
      .catch(error => {
        console.error('Error updating house:', error);
        this.isLoading = false;
        alert('Помилка збереження змін. Змініть дані чи спробуйте пізніше.');
      });
  }

  startAddNew(): void {
    this.isAddingNewRow = true;
    this.filteredStreetsForAdd = [];

    this.addForm.reset({
      houseNumber: '',
      cityId: null,
      streetId: null
    });
  }

  cancelAddNew(): void {
    this.isAddingNewRow = false;
    this.filteredStreetsForAdd = [];

    this.addForm.reset({
      houseNumber: '',
      cityId: null,
      streetId: null
    });
  }

  saveNewHouse(): void {
    if (this.addForm.invalid) {
      return;
    }

    const formValues = this.addForm.value;
    console.log('New house form values:', formValues);

    const newHouse: AddHouseDto = {
      houseNumber: formValues.houseNumber,
      streetId: formValues.streetId
    };

    console.log('Creating new house:', newHouse);

    this.isLoading = true;
    this.housesService.create(newHouse)
      .then(() => {
        console.log('House created successfully');
        this.isAddingNewRow = false;
        this.filteredStreetsForAdd = [];

        this.addForm.reset({
          houseNumber: '',
          cityId: null,
          streetId: null
        });
        this.loadHouses();
      })
      .catch(error => {
        console.error('Error creating house:', error);
        this.isLoading = false;
        alert('Помилка збереження змін. Змініть дані чи спробуйте пізніше.');
      });
  }

  deleteHouse(id: number): void {
    if (confirm('Ви впевнені, що хочете видалити цей будинок?')) {
      this.isLoading = true;
      this.housesService.delete(id)
        .then(() => {
          console.log('House deleted successfully');
          this.loadHouses();
        })
        .catch(error => {
          console.error('Error deleting house:', error);
          this.isLoading = false;
          alert('Помилка видалення будинку. Спробуйте пізніше.');
        });
    }
  }

  clearFilters(): void {
    this.filterForm.reset({
      houseNumberContains: '',
      cityIds: null,
      streetIds: null
    });
    this.loadHouses();
  }

  getFilteredStreetsForFilter(): any[] {
    const selectedCityId = this.filterForm.get('cityIds')?.value;
    if (selectedCityId) {
      return this.streets.filter(street => street.cityId === selectedCityId);
    }
    return this.streets;
  }

  onFilterCityChange(): void {
    // Reset street filter when city filter changes
    this.filterForm.patchValue({ streetIds: null });
  }

  // Add this method to the HousesComponent class
  getSelectedCityNameForAdd(): string {
    const cityId = this.addForm.get('cityId')?.value;
    if (cityId) {
      const city = this.cities.find(c => c.id === cityId);
      return city?.cityName || '';
    }
    return '';
  }
}