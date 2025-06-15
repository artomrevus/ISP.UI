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
  AddLocationDto,
  FullLocation,
  LocationDto,
  LocationFilterParameters,
  LocationPaginationOptions,
  LocationSortOptions
} from "../../../models/isp/location.models";
import { LocationsService } from "../../../services/isp/locations.service";
import { LocationTypesService } from "../../../services/isp/location-types.service";
import { HousesService } from "../../../services/isp/houses.service";
import { StreetsService } from "../../../services/isp/streets.service";
import { CitiesService } from "../../../services/isp/cities.service";
import { FullCity } from '../../../models/isp/city.models';
import { FullStreet } from '../../../models/isp/street.models';
import { FullHouse } from '../../../models/isp/house.models';
import { FullLocationType } from '../../../models/isp/location-type.models';

@Component({
  selector: 'app-locations',
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
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.css']
})
export class LocationsComponent implements OnInit {
  displayedColumns: string[] = ['apartmentNumber', 'houseNumber', 'street', 'city', 'locationType', 'actions'];
  locations: FullLocation[] = [];
  totalItems = 0;
  isLoading = false;

  filterForm: FormGroup;
  editForm: FormGroup;
  addForm: FormGroup;

  filter: LocationFilterParameters = {
    cityIds: [],
    streetIds: [],
    houseIds: [],
    locationTypeIds: []
  };
  sort: LocationSortOptions = { ascending: true };
  pagination: LocationPaginationOptions = {
    pageSize: 10,
    pageNumber: 0,
    totalItems: 0
  };

  private filterSubject = new Subject<void>();

  editingId: number | null = null;
  isAddingNewRow = false;

  cities: FullCity[] = [];
  streets: FullStreet[] = [];
  houses: FullHouse[] = [];
  locationTypes: FullLocationType[] = [];

  // Filtered options for forms
  filteredStreetsForEdit: FullStreet[] = [];
  filteredHousesForEdit: FullHouse[] = [];
  filteredStreetsForAdd: FullStreet[] = [];
  filteredHousesForAdd: FullHouse[] = [];

  // Filtered options for filters
  filteredStreetsForFilter: FullStreet[] = [];
  filteredHousesForFilter: FullHouse[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) matSort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<FullLocation>;

  constructor(
    private locationsService: LocationsService,
    private locationTypesService: LocationTypesService,
    private housesService: HousesService,
    private streetsService: StreetsService,
    private citiesService: CitiesService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      cityIds: [[]],
      streetIds: [[]],
      houseIds: [[]],
      locationTypeIds: [[]]
    });

    this.editForm = this.fb.group({
      apartmentNumber: [null],
      locationTypeId: [null, Validators.required],
      cityId: [null, Validators.required],
      streetId: [null, Validators.required],
      houseId: [null, Validators.required]
    });

    this.addForm = this.fb.group({
      apartmentNumber: [null],
      locationTypeId: [null, Validators.required],
      cityId: [null, Validators.required],
      streetId: [null, Validators.required],
      houseId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadLocations();
    this.loadCities();
    this.loadStreets();
    this.loadHouses();
    this.loadLocationTypes();

    this.filterSubject
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.pagination.pageNumber = 0;
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
        this.loadLocations();
      });

    this.filterForm.valueChanges.subscribe(() => {
      this.filterSubject.next();
    });

    // Watch for cascading changes in edit form
    this.editForm.get('cityId')?.valueChanges.subscribe(cityId => {
      this.onEditCityChange(cityId);
    });

    this.editForm.get('streetId')?.valueChanges.subscribe(streetId => {
      this.onEditStreetChange(streetId);
    });

    // Watch for cascading changes in add form
    this.addForm.get('cityId')?.valueChanges.subscribe(cityId => {
      this.onAddCityChange(cityId);
    });

    this.addForm.get('streetId')?.valueChanges.subscribe(streetId => {
      this.onAddStreetChange(streetId);
    });
  }

  loadLocations(): void {
    this.isLoading = true;

    const filterForm = this.filterForm.value;

    this.filter = {
      cityIds: filterForm.cityIds || [],
      streetIds: filterForm.streetIds || [],
      houseIds: filterForm.houseIds || [],
      locationTypeIds: filterForm.locationTypeIds || []
    };

    this.locationsService.getFilteredFull(
      this.filter,
      this.sort,
      this.pagination.pageNumber + 1,
      this.pagination.pageSize
    ).then(result => {
      this.locations = result.items;
      this.totalItems = result.totalCount;
      this.pagination.totalItems = result.totalCount;
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading locations:', error);
      this.isLoading = false;
      alert('Помилка завантаження даних. Спробуйте пізніше.');
    });
  }

  async loadCities() {
    try {
      this.cities = await this.citiesService.get();
    } catch (error) {
      console.error('Error loading cities:', error);
      this.cities = [];
    }
  }

  async loadStreets() {
    try {
      this.streets = await this.streetsService.getFull();
      // Initialize filter streets to all streets initially
      this.filteredStreetsForFilter = this.streets;
    } catch (error) {
      console.error('Error loading streets:', error);
      this.streets = [];
      this.filteredStreetsForFilter = [];
    }
  }

  async loadHouses() {
    try {
      this.houses = await this.housesService.getFull();
      // Initialize filter houses to all houses initially
      this.filteredHousesForFilter = this.houses;
    } catch (error) {
      console.error('Error loading houses:', error);
      this.houses = [];
      this.filteredHousesForFilter = [];
    }
  }

  async loadLocationTypes() {
    try {
      this.locationTypes = await this.locationTypesService.get();
    } catch (error) {
      console.error('Error loading location types:', error);
      this.locationTypes = [];
    }
  }

  // Edit form cascading methods
  onEditCityChange(cityId: number): void {
    if (cityId) {
      this.filteredStreetsForEdit = this.streets.filter(street => street.cityId === cityId);
      this.editForm.patchValue({ streetId: null, houseId: null });
      this.filteredHousesForEdit = [];
    } else {
      this.filteredStreetsForEdit = [];
      this.filteredHousesForEdit = [];
    }
  }

  onEditStreetChange(streetId: number): void {
    if (streetId) {
      this.filteredHousesForEdit = this.houses.filter(house => house.streetId === streetId);
      this.editForm.patchValue({ houseId: null });
    } else {
      this.filteredHousesForEdit = [];
    }
  }

  // Add form cascading methods
  onAddCityChange(cityId: number): void {
    if (cityId) {
      this.filteredStreetsForAdd = this.streets.filter(street => street.cityId === cityId);
      this.addForm.patchValue({ streetId: null, houseId: null });
      this.filteredHousesForAdd = [];
    } else {
      this.filteredStreetsForAdd = [];
      this.filteredHousesForAdd = [];
    }
  }

  onAddStreetChange(streetId: number): void {
    if (streetId) {
      this.filteredHousesForAdd = this.houses.filter(house => house.streetId === streetId);
      this.addForm.patchValue({ houseId: null });
    } else {
      this.filteredHousesForAdd = [];
    }
  }

  // Filter cascading methods
  onFilterCityChange(): void {
    const selectedCityIds = this.filterForm.get('cityIds')?.value || [];
    if (selectedCityIds.length > 0) {
      this.filteredStreetsForFilter = this.streets.filter(street => 
        selectedCityIds.includes(street.cityId)
      );
    } else {
      this.filteredStreetsForFilter = this.streets;
    }
    // Reset dependent filters when city changes
    this.filterForm.patchValue({ streetIds: [], houseIds: [] });
    this.onFilterStreetChange(); // Update houses based on new street selection
  }

  onFilterStreetChange(): void {
    const selectedStreetIds = this.filterForm.get('streetIds')?.value || [];
    if (selectedStreetIds.length > 0) {
      this.filteredHousesForFilter = this.houses.filter(house => 
        selectedStreetIds.includes(house.streetId)
      );
    } else {
      // If no streets selected, show houses from all available streets
      const availableStreetIds = this.filteredStreetsForFilter.map(s => s.id);
      this.filteredHousesForFilter = this.houses.filter(house => 
        availableStreetIds.includes(house.streetId)
      );
    }
    // Reset house selection when streets change
    this.filterForm.patchValue({ houseIds: [] });
  }

  onPageChange(event: PageEvent): void {
    this.pagination.pageSize = event.pageSize;
    this.pagination.pageNumber = event.pageIndex;
    this.loadLocations();
  }

  onSortChange(sortState: Sort): void {
    this.sort.sortBy = sortState.active;
    this.sort.ascending = sortState.direction === 'asc';
    this.loadLocations();
  }

  startEdit(location: FullLocation): void {
    this.editingId = location.id;

    // Set city first to populate streets
    const cityId = location.house?.street?.cityId;
    const streetId = location.house?.streetId;

    this.editForm.patchValue({
      apartmentNumber: location.apartmentNumber,
      locationTypeId: location.locationTypeId,
      cityId: cityId
    });

    // Filter streets and houses based on relationships
    if (cityId) {
      this.filteredStreetsForEdit = this.streets.filter(street => street.cityId === cityId);
      this.editForm.patchValue({ streetId: streetId });

      if (streetId) {
        this.filteredHousesForEdit = this.houses.filter(house => house.streetId === streetId);
        this.editForm.patchValue({ houseId: location.houseId });
      }
    }
  }

  cancelEdit(): void {
    this.editingId = null;
    this.filteredStreetsForEdit = [];
    this.filteredHousesForEdit = [];
    this.editForm.reset({
      apartmentNumber: null,
      locationTypeId: null,
      cityId: null,
      streetId: null,
      houseId: null
    });
  }

  saveEdit(): void {
    if (this.editForm.invalid) {
      return;
    }

    const formValues = this.editForm.value;
    console.log('Form values before save:', formValues);

    const updatedLocation: LocationDto = {
      id: this.editingId!,
      apartmentNumber: formValues.apartmentNumber || undefined,
      locationTypeId: formValues.locationTypeId,
      houseId: formValues.houseId
    };

    console.log('Saving location:', updatedLocation);

    this.isLoading = true;
    this.locationsService.update(updatedLocation)
      .then(() => {
        console.log('Location updated successfully');
        this.editingId = null;
        this.filteredStreetsForEdit = [];
        this.filteredHousesForEdit = [];
        this.editForm.reset({
          apartmentNumber: null,
          locationTypeId: null,
          cityId: null,
          streetId: null,
          houseId: null
        });
        this.loadLocations();
      })
      .catch(error => {
        console.error('Error updating location:', error);
        this.isLoading = false;
        alert('Помилка збереження змін. Змініть дані чи спробуйте пізніше.');
      });
  }

  startAddNew(): void {
    this.isAddingNewRow = true;
    this.filteredStreetsForAdd = [];
    this.filteredHousesForAdd = [];

    this.addForm.reset({
      apartmentNumber: null,
      locationTypeId: null,
      cityId: null,
      streetId: null,
      houseId: null
    });
  }

  cancelAddNew(): void {
    this.isAddingNewRow = false;
    this.filteredStreetsForAdd = [];
    this.filteredHousesForAdd = [];

    this.addForm.reset({
      apartmentNumber: null,
      locationTypeId: null,
      cityId: null,
      streetId: null,
      houseId: null
    });
  }

  saveNewLocation(): void {
    if (this.addForm.invalid) {
      return;
    }

    const formValues = this.addForm.value;
    console.log('New location form values:', formValues);

    const newLocation: AddLocationDto = {
      apartmentNumber: formValues.apartmentNumber || undefined,
      locationTypeId: formValues.locationTypeId,
      houseId: formValues.houseId
    };

    console.log('Creating new location:', newLocation);

    this.isLoading = true;
    this.locationsService.create(newLocation)
      .then(() => {
        console.log('Location created successfully');
        this.isAddingNewRow = false;
        this.filteredStreetsForAdd = [];
        this.filteredHousesForAdd = [];

        this.addForm.reset({
          apartmentNumber: null,
          locationTypeId: null,
          cityId: null,
          streetId: null,
          houseId: null
        });
        this.loadLocations();
      })
      .catch(error => {
        console.error('Error creating location:', error);
        this.isLoading = false;
        alert('Помилка збереження змін. Змініть дані чи спробуйте пізніше.');
      });
  }

  deleteLocation(id: number): void {
    if (confirm('Ви впевнені, що хочете видалити цю локацію?')) {
      this.isLoading = true;
      this.locationsService.delete(id)
        .then(() => {
          console.log('Location deleted successfully');
          this.loadLocations();
        })
        .catch(error => {
          console.error('Error deleting location:', error);
          this.isLoading = false;
          alert('Помилка видалення локації. Спробуйте пізніше.');
        });
    }
  }

  clearFilters(): void {
    this.filterForm.reset({
      cityIds: [],
      streetIds: [],
      houseIds: [],
      locationTypeIds: []
    });
    this.filteredStreetsForFilter = this.streets;
    this.filteredHousesForFilter = this.houses;
    this.loadLocations();
  }

  getSelectedCityNameForAdd(): string {
    const cityId = this.addForm.get('cityId')?.value;
    if (cityId) {
      const city = this.cities.find(c => c.id === cityId);
      return city?.cityName || '';
    }
    return '';
  }

  getSelectedStreetNameForAdd(): string {
    const streetId = this.addForm.get('streetId')?.value;
    if (streetId) {
      const street = this.streets.find(s => s.id === streetId);
      return street?.streetName || '';
    }
    return '';
  }

  getSelectedHouseNumberForAdd(): string {
    const houseId = this.addForm.get('houseId')?.value;
    if (houseId) {
      const house = this.houses.find(h => h.id === houseId);
      return house?.houseNumber || '';
    }
    return '';
  }

  getSelectedLocationTypeNameForAdd(): string {
    const locationTypeId = this.addForm.get('locationTypeId')?.value;
    if (locationTypeId) {
      const locationType = this.locationTypes.find(lt => lt.id === locationTypeId);
      return locationType?.locationTypeName || '';
    }
    return '';
  }
}