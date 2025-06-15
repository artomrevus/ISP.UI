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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { debounceTime, Subject } from 'rxjs';
import {
  AddClientDto,
  FullClient,
  ClientDto,
  ClientFilterParameters,
  ClientPaginationOptions,
  ClientSortOptions
} from "../../../models/isp/client.models";
import { ClientsService } from "../../../services/isp/clients.service";
import { ClientStatusesService } from "../../../services/isp/client-statuses.service";
import { LocationsService } from "../../../services/isp/locations.service";
import { LocationTypesService } from "../../../services/isp/location-types.service";
import { HousesService } from "../../../services/isp/houses.service";
import { StreetsService } from "../../../services/isp/streets.service";
import { CitiesService } from "../../../services/isp/cities.service";
import { FullCity } from '../../../models/isp/city.models';
import { FullStreet } from '../../../models/isp/street.models';
import { FullHouse } from '../../../models/isp/house.models';
import { FullLocation } from '../../../models/isp/location.models';
import { FullLocationType } from '../../../models/isp/location-type.models';
import { FullClientStatus } from '../../../models/isp/client-status.models';
import { DateFormatterService } from '../../../services/common/date-formatter.service';

@Component({
  selector: 'app-clients',
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
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  displayedColumns: string[] = [
    'firstName', 'lastName', 'email', 'phoneNumber', 'clientStatus', 'registrationDate',
    'apartmentNumber', 'houseNumber', 'street', 'city', 'locationType', 'actions'
  ];
  clients: FullClient[] = [];
  totalItems = 0;
  isLoading = false;
  isLocationsLoading = false;

  filterForm: FormGroup;
  editForm: FormGroup;
  addForm: FormGroup;

  filter: ClientFilterParameters = {
    cityIds: [],
    streetIds: [],
    houseIds: [],
    locationTypeIds: [],
    locationIds: [],
    clientStatusIds: []
  };
  sort: ClientSortOptions = { ascending: true };
  pagination: ClientPaginationOptions = {
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
  locations: FullLocation[] = [];
  locationTypes: FullLocationType[] = [];
  clientStatuses: FullClientStatus[] = [];

  // Filtered options for forms
  filteredStreetsForEdit: FullStreet[] = [];
  filteredHousesForEdit: FullHouse[] = [];
  filteredLocationsForEdit: FullLocation[] = [];
  filteredStreetsForAdd: FullStreet[] = [];
  filteredHousesForAdd: FullHouse[] = [];
  filteredLocationsForAdd: FullLocation[] = [];

  // Filtered options for filters
  filteredStreetsForFilter: FullStreet[] = [];
  filteredHousesForFilter: FullHouse[] = [];
  filteredLocationsForFilter: FullLocation[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) matSort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<FullClient>;

  constructor(
    private clientsService: ClientsService,
    private clientStatusesService: ClientStatusesService,
    private locationsService: LocationsService,
    private locationTypesService: LocationTypesService,
    private housesService: HousesService,
    private streetsService: StreetsService,
    private citiesService: CitiesService,
    public dateFormatter: DateFormatterService, 
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      cityIds: [[]],
      streetIds: [[]],
      houseIds: [[]],
      locationTypeIds: [[]],
      locationIds: [[]],
      clientStatusIds: [[]],
      firstNameContains: [''],
      lastNameContains: [''],
      phoneNumberContains: [''],
      emailContains: [''],
      registrationDateFrom: [null],
      registrationDateTo: [null]
    });

    this.editForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      clientStatusId: [null, Validators.required],
      registrationDate: [null, Validators.required],
      cityId: [null, Validators.required],
      streetId: [null, Validators.required],
      houseId: [null, Validators.required],
      locationId: [null, Validators.required]
    });

    this.addForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      clientStatusId: [null, Validators.required],
      registrationDate: [new Date(), Validators.required],
      cityId: [null, Validators.required],
      streetId: [null, Validators.required],
      houseId: [null, Validators.required],
      locationId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadCities();
    this.loadStreets();
    this.loadHouses();
    this.loadLocations();
    this.loadLocationTypes();
    this.loadClientStatuses();

    this.filterSubject
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.pagination.pageNumber = 0;
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
        this.loadClients();
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

    this.editForm.get('houseId')?.valueChanges.subscribe(houseId => {
      this.onEditHouseChange(houseId);
    });

    // Watch for cascading changes in add form
    this.addForm.get('cityId')?.valueChanges.subscribe(cityId => {
      this.onAddCityChange(cityId);
    });

    this.addForm.get('streetId')?.valueChanges.subscribe(streetId => {
      this.onAddStreetChange(streetId);
    });

    this.addForm.get('houseId')?.valueChanges.subscribe(houseId => {
      this.onAddHouseChange(houseId);
    });
  }

  loadClients(): void {
    this.isLoading = true;

    const filterForm = this.filterForm.value;

    this.filter = {
      cityIds: filterForm.cityIds || [],
      streetIds: filterForm.streetIds || [],
      houseIds: filterForm.houseIds || [],
      locationTypeIds: filterForm.locationTypeIds || [],
      locationIds: filterForm.locationIds || [],
      clientStatusIds: filterForm.clientStatusIds || [],
      firstNameContains: filterForm.firstNameContains || undefined,
      lastNameContains: filterForm.lastNameContains || undefined,
      phoneNumberContains: filterForm.phoneNumberContains || undefined,
      emailContains: filterForm.emailContains || undefined,
      registrationDateFrom: filterForm.registrationDateFrom ? 
        filterForm.registrationDateFrom.toISOString().split('T')[0] : undefined,
      registrationDateTo: filterForm.registrationDateTo ? 
        filterForm.registrationDateTo.toISOString().split('T')[0] : undefined
    };

    this.clientsService.getFilteredFull(
      this.filter,
      this.sort,
      this.pagination.pageNumber + 1,
      this.pagination.pageSize
    ).then(result => {
      this.clients = result.items;
      this.totalItems = result.totalCount;
      this.pagination.totalItems = result.totalCount;
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading clients:', error);
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
      this.filteredHousesForFilter = this.houses;
    } catch (error) {
      console.error('Error loading houses:', error);
      this.houses = [];
      this.filteredHousesForFilter = [];
    }
  }

  async loadLocations() {
    try {
      this.isLocationsLoading = true;
      this.locations = await this.locationsService.getFull();
      this.filteredLocationsForFilter = this.locations;
      this.isLocationsLoading = false;
    } catch (error) {
      console.error('Error loading locations:', error);
      this.locations = [];
      this.filteredLocationsForFilter = [];
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

  async loadClientStatuses() {
    try {
      this.clientStatuses = await this.clientStatusesService.get();
    } catch (error) {
      console.error('Error loading client statuses:', error);
      this.clientStatuses = [];
    }
  }

  // Edit form cascading methods
  onEditCityChange(cityId: number): void {
    if (cityId) {
      this.filteredStreetsForEdit = this.streets.filter(street => street.cityId === cityId);
      this.editForm.patchValue({ streetId: null, houseId: null, locationId: null });
      this.filteredHousesForEdit = [];
      this.filteredLocationsForEdit = [];
    } else {
      this.filteredStreetsForEdit = [];
      this.filteredHousesForEdit = [];
      this.filteredLocationsForEdit = [];
    }
  }

  onEditStreetChange(streetId: number): void {
    if (streetId) {
      this.filteredHousesForEdit = this.houses.filter(house => house.streetId === streetId);
      this.editForm.patchValue({ houseId: null, locationId: null });
      this.filteredLocationsForEdit = [];
    } else {
      this.filteredHousesForEdit = [];
      this.filteredLocationsForEdit = [];
    }
  }

  onEditHouseChange(houseId: number): void {
    if (houseId) {
      this.filteredLocationsForEdit = this.locations.filter(location => location.houseId === houseId);
      this.editForm.patchValue({ locationId: null });
    } else {
      this.filteredLocationsForEdit = [];
    }
  }

  // Add form cascading methods
  onAddCityChange(cityId: number): void {
    if (cityId) {
      this.filteredStreetsForAdd = this.streets.filter(street => street.cityId === cityId);
      this.addForm.patchValue({ streetId: null, houseId: null, locationId: null });
      this.filteredHousesForAdd = [];
      this.filteredLocationsForAdd = [];
    } else {
      this.filteredStreetsForAdd = [];
      this.filteredHousesForAdd = [];
      this.filteredLocationsForAdd = [];
    }
  }

  onAddStreetChange(streetId: number): void {
    if (streetId) {
      this.filteredHousesForAdd = this.houses.filter(house => house.streetId === streetId);
      this.addForm.patchValue({ houseId: null, locationId: null });
      this.filteredLocationsForAdd = [];
    } else {
      this.filteredHousesForAdd = [];
      this.filteredLocationsForAdd = [];
    }
  }

  onAddHouseChange(houseId: number): void {
    if (houseId) {
      this.filteredLocationsForAdd = this.locations.filter(location => location.houseId === houseId);
      this.addForm.patchValue({ locationId: null });
    } else {
      this.filteredLocationsForAdd = [];
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
    this.filterForm.patchValue({ streetIds: [], houseIds: [], locationIds: [] });
    this.onFilterStreetChange();
  }

  onFilterStreetChange(): void {
    const selectedStreetIds = this.filterForm.get('streetIds')?.value || [];
    if (selectedStreetIds.length > 0) {
      this.filteredHousesForFilter = this.houses.filter(house => 
        selectedStreetIds.includes(house.streetId)
      );
    } else {
      const availableStreetIds = this.filteredStreetsForFilter.map(s => s.id);
      this.filteredHousesForFilter = this.houses.filter(house => 
        availableStreetIds.includes(house.streetId)
      );
    }
    this.filterForm.patchValue({ houseIds: [], locationIds: [] });
    this.onFilterHouseChange();
  }

  onFilterHouseChange(): void {
    const selectedHouseIds = this.filterForm.get('houseIds')?.value || [];
    if (selectedHouseIds.length > 0) {
      this.filteredLocationsForFilter = this.locations.filter(location => 
        selectedHouseIds.includes(location.houseId)
      );
    } else {
      const availableHouseIds = this.filteredHousesForFilter.map(h => h.id);
      this.filteredLocationsForFilter = this.locations.filter(location => 
        availableHouseIds.includes(location.houseId)
      );
    }
    this.filterForm.patchValue({ locationIds: [] });
  }

  onPageChange(event: PageEvent): void {
    this.pagination.pageSize = event.pageSize;
    this.pagination.pageNumber = event.pageIndex;
    this.loadClients();
  }

  onSortChange(sortState: Sort): void {
    this.sort.sortBy = sortState.active;
    this.sort.ascending = sortState.direction === 'asc';
    this.loadClients();
  }

  startEdit(client: FullClient): void {
    this.editingId = client.id;

    const cityId = client.location?.house?.street?.cityId;
    const streetId = client.location?.house?.streetId;
    const houseId = client.location?.houseId;

    this.editForm.patchValue({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phoneNumber: client.phoneNumber,
      clientStatusId: client.clientStatusId,
      registrationDate: new Date(client.registrationDate),
      cityId: cityId
    });

    // Set up cascading selections
    if (cityId) {
      this.filteredStreetsForEdit = this.streets.filter(street => street.cityId === cityId);
      this.editForm.patchValue({ streetId: streetId });

      if (streetId) {
        this.filteredHousesForEdit = this.houses.filter(house => house.streetId === streetId);
        this.editForm.patchValue({ houseId: houseId });

        if (houseId) {
          this.filteredLocationsForEdit = this.locations.filter(location => location.houseId === houseId);
          this.editForm.patchValue({ locationId: client.locationId });
        }
      }
    }
  }

  cancelEdit(): void {
    this.editingId = null;
    this.filteredStreetsForEdit = [];
    this.filteredHousesForEdit = [];
    this.filteredLocationsForEdit = [];
    this.editForm.reset();
  }

  saveEdit(): void {
    if (this.editForm.invalid) {
      return;
    }

    const formValues = this.editForm.value;
    const updatedClient: ClientDto = {
      id: this.editingId!,
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      email: formValues.email,
      phoneNumber: formValues.phoneNumber,
      clientStatusId: formValues.clientStatusId,
      locationId: formValues.locationId,
      registrationDate: formValues.registrationDate.toISOString().split('T')[0]
    };

    this.isLoading = true;
    this.clientsService.update(updatedClient)
      .then(() => {
        this.editingId = null;
        this.filteredStreetsForEdit = [];
        this.filteredHousesForEdit = [];
        this.filteredLocationsForEdit = [];
        this.editForm.reset();
        this.loadClients();
      })
      .catch(error => {
        console.error('Error updating client:', error);
        this.isLoading = false;
        alert('Помилка збереження змін. Змініть дані чи спробуйте пізніше.');
      });
  }

  startAddNew(): void {
    this.isAddingNewRow = true;
    this.filteredStreetsForAdd = [];
    this.filteredHousesForAdd = [];
    this.filteredLocationsForAdd = [];

    this.addForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      clientStatusId: null,
      registrationDate: new Date(),
      cityId: null,
      streetId: null,
      houseId: null,
      locationId: null
    });
  }

  cancelAddNew(): void {
    this.isAddingNewRow = false;
    this.filteredStreetsForAdd = [];
    this.filteredHousesForAdd = [];
    this.filteredLocationsForAdd = [];
    this.addForm.reset();
  }

  saveNewClient(): void {
    if (this.addForm.invalid) {
      return;
    }

    const formValues = this.addForm.value;
    const newClient: AddClientDto = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      email: formValues.email,
      phoneNumber: formValues.phoneNumber,
      clientStatusId: formValues.clientStatusId,
      locationId: formValues.locationId,
      registrationDate: formValues.registrationDate.toISOString().split('T')[0]
    };

    this.isLoading = true;
    this.clientsService.create(newClient)
      .then(() => {
        this.isAddingNewRow = false;
        this.filteredStreetsForAdd = [];
        this.filteredHousesForAdd = [];
        this.filteredLocationsForAdd = [];
        this.addForm.reset();
        this.loadClients();
      })
      .catch(error => {
        console.error('Error creating client:', error);
        this.isLoading = false;
        alert('Помилка збереження змін. Змініть дані чи спробуйте пізніше.');
      });
  }

  deleteClient(id: number): void {
    if (confirm('Ви впевнені, що хочете видалити цього клієнта?')) {
      this.isLoading = true;
      this.clientsService.delete(id)
        .then(() => {
          this.loadClients();
        })
        .catch(error => {
          console.error('Error deleting client:', error);
          this.isLoading = false;
          alert('Помилка видалення клієнта. Спробуйте пізніше.');
        });
    }
  }

  clearFilters(): void {
    this.filterForm.reset({
      cityIds: [],
      streetIds: [],
      houseIds: [],
      locationTypeIds: [],
      locationIds: [],
      clientStatusIds: [],
      firstNameContains: '',
      lastNameContains: '',
      phoneNumberContains: '',
      emailContains: '',
      registrationDateFrom: null,
      registrationDateTo: null
    });
    this.filteredStreetsForFilter = this.streets;
    this.filteredHousesForFilter = this.houses;
    this.filteredLocationsForFilter = this.locations;
    this.loadClients();
  }

  // Helper methods for display values
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

  getSelectedLocationForAdd(): FullLocation | null {
    const locationId = this.addForm.get('locationId')?.value;
    if (locationId) {
      return this.locations.find(l => l.id === locationId) || null;
    }
    return null;
  }

  getLocationDisplayText(location: FullLocation): string {
    const parts = [];
    if (location.apartmentNumber) {
      parts.push(`Кв. ${location.apartmentNumber}`);
    }
    if (location.locationType?.locationTypeName) {
      parts.push(location.locationType.locationTypeName);
    }
    return parts.join(', ') || 'Локація';
  }
}