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
  AddInternetTariffDto,
  FullInternetTariff,
  InternetTariffDto,
  InternetTariffFilterParameters,
  InternetTariffPaginationOptions,
  InternetTariffSortOptions
} from "../../models/isp/internet-tariff.models";
import { InternetTariffsService } from "../../services/isp/internet-tariffs.service";
import { LocationTypesService } from "../../services/isp/location-types.service";
import { InternetTariffStatusesService } from "../../services/isp/internet-tariff-statuses.service";
import { FullLocationType } from '../../models/isp/location-type.models';
import { FullInternetTariffStatus } from '../../models/isp/internet-tariff-status.models';

@Component({
  selector: 'app-internet-tariffs',
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
  templateUrl: './internet-tariffs.component.html',
  styleUrls: ['./internet-tariffs.component.css']
})
export class InternetTariffsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'price', 'internetSpeedMbits', 'internetTariffStatus', 'locationType', 'description', 'actions'];
  tariffs: FullInternetTariff[] = [];
  totalItems = 0;
  isLoading = false;

  filterForm: FormGroup;
  editForm: FormGroup;
  addForm: FormGroup;

  filter: InternetTariffFilterParameters = {
    locationTypeIds: [],
    InternetTariffStatusIds: []
  };
  sort: InternetTariffSortOptions = { ascending: true };
  pagination: InternetTariffPaginationOptions = {
    pageSize: 10,
    pageNumber: 0,
    totalItems: 0
  };

  private filterSubject = new Subject<void>();

  editingId: number | null = null;
  isAddingNewRow = false;

  locationTypes: FullLocationType[] = [];
  internetTariffStatuses: FullInternetTariffStatus[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) matSort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<FullInternetTariff>;

  constructor(
    private internetTariffService: InternetTariffsService,
    private locationTypesService: LocationTypesService,
    private internetTariffStatusesService: InternetTariffStatusesService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      nameContains: [null],
      priceFrom: [null],
      priceTo: [null],
      internetSpeedMbitsFrom: [null],
      internetSpeedMbitsTo: [null],
      locationTypeIds: [[]],
      internetTariffStatusIds: [[]]
    });

    this.editForm = this.fb.group({
      name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      internetSpeedMbits: [null, [Validators.required, Validators.min(1)]],
      description: ['', Validators.required],
      internetTariffStatusId: [null, Validators.required],
      locationTypeId: [null, Validators.required]
    });

    this.addForm = this.fb.group({
      name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      internetSpeedMbits: [null, [Validators.required, Validators.min(1)]],
      description: ['', Validators.required],
      internetTariffStatusId: [null, Validators.required],
      locationTypeId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTariffs();
    this.loadLocationTypes();
    this.loadInternetTariffStatuses();

    this.filterSubject
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.pagination.pageNumber = 0;
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
        this.loadTariffs();
      });

    this.filterForm.valueChanges.subscribe(() => {
      this.filterSubject.next();
    });
  }

  loadTariffs(): void {
    this.isLoading = true;

    const filterForm = this.filterForm.value;

    this.filter = {
      nameContains: filterForm.nameContains,
      priceFrom: filterForm.priceFrom,
      priceTo: filterForm.priceTo,
      internetSpeedMbitsFrom: filterForm.internetSpeedMbitsFrom,
      internetSpeedMbitsTo: filterForm.internetSpeedMbitsTo,
      locationTypeIds: filterForm.locationTypeIds || [],
      InternetTariffStatusIds: filterForm.internetTariffStatusIds || []
    };

    this.internetTariffService.getFilteredFull(
      this.filter,
      this.sort,
      this.pagination.pageNumber + 1,
      this.pagination.pageSize
    ).then(result => {
      this.tariffs = result.items;
      this.totalItems = result.totalCount;
      this.pagination.totalItems = result.totalCount;
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading tariffs:', error);
      this.isLoading = false;
      alert('Помилка завантаження даних. Спробуйте пізніше.');
    });
  }

  async loadLocationTypes() {
    this.locationTypes = await this.locationTypesService.get();
  }

  async loadInternetTariffStatuses() {
    this.internetTariffStatuses = await this.internetTariffStatusesService.get();
  }

  onPageChange(event: PageEvent): void {
    this.pagination.pageSize = event.pageSize;
    this.pagination.pageNumber = event.pageIndex;
    this.loadTariffs();
  }

  onSortChange(sortState: Sort): void {
    this.sort.sortBy = sortState.active;
    this.sort.ascending = sortState.direction === 'asc';
    this.loadTariffs();
  }

  startEdit(tariff: FullInternetTariff): void {
    this.editingId = tariff.id;

    this.editForm.setValue({
      name: tariff.name,
      price: tariff.price,
      internetSpeedMbits: tariff.internetSpeedMbits,
      description: tariff.description,
      internetTariffStatusId: tariff.internetTariffStatusId,
      locationTypeId: tariff.locationTypeId
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editForm.reset({
      name: '',
      price: null,
      internetSpeedMbits: null,
      description: '',
      internetTariffStatusId: null,
      locationTypeId: null
    });
  }

  saveEdit(): void {
    if (this.editForm.invalid) {
      return;
    }

    const formValues = this.editForm.value;
    console.log('Form values before save:', formValues);

    const updatedTariff: InternetTariffDto = {
      id: this.editingId!,
      name: formValues.name,
      price: formValues.price,
      internetSpeedMbits: formValues.internetSpeedMbits,
      description: formValues.description,
      internetTariffStatusId: formValues.internetTariffStatusId,
      locationTypeId: formValues.locationTypeId
    };

    console.log('Saving tariff:', updatedTariff);

    this.isLoading = true;
    this.internetTariffService.update(updatedTariff)
      .then(() => {
        console.log('Tariff updated successfully');
        this.editingId = null;
        this.editForm.reset({
          name: '',
          price: null,
          internetSpeedMbits: null,
          description: '',
          internetTariffStatusId: null,
          locationTypeId: null
        });
        this.loadTariffs();
      })
      .catch(error => {
        console.error('Error updating tariff:', error);
        this.isLoading = false;
        alert('Помилка збереження змін. Змініть дані чи спробуйте пізніше.');
      });
  }

  startAddNew(): void {
    this.isAddingNewRow = true;

    this.addForm.reset({
      name: '',
      price: null,
      internetSpeedMbits: null,
      description: '',
      internetTariffStatusId: null,
      locationTypeId: null
    });
  }

  cancelAddNew(): void {
    this.isAddingNewRow = false;

    this.addForm.reset({
      name: '',
      price: null,
      internetSpeedMbits: null,
      description: '',
      internetTariffStatusId: null,
      locationTypeId: null
    });
  }

  saveNewTariff(): void {
    if (this.addForm.invalid) {
      return;
    }

    const formValues = this.addForm.value;
    console.log('New tariff form values:', formValues);

    const newTariff: AddInternetTariffDto = {
      name: formValues.name,
      price: formValues.price,
      internetSpeedMbits: formValues.internetSpeedMbits,
      description: formValues.description,
      internetTariffStatusId: formValues.internetTariffStatusId,
      locationTypeId: formValues.locationTypeId
    };

    console.log('Creating new tariff:', newTariff);

    this.isLoading = true;
    this.internetTariffService.create(newTariff)
      .then(() => {
        console.log('Tariff created successfully');
        this.isAddingNewRow = false;

        this.addForm.reset({
          name: '',
          price: null,
          internetSpeedMbits: null,
          description: '',
          internetTariffStatusId: null,
          locationTypeId: null
        });
        this.loadTariffs();
      })
      .catch(error => {
        console.error('Error creating tariff:', error);
        this.isLoading = false;
        alert('Помилка збереження змін. Змініть дані чи спробуйте пізніше.');
      });
  }

  deleteTariff(id: number): void {
    if (confirm('Ви впевнені, що хочете видалити цей тариф?')) {
      this.isLoading = true;
      this.internetTariffService.delete(id)
        .then(() => {
          console.log('Tariff deleted successfully');
          this.loadTariffs();
        })
        .catch(error => {
          console.error('Error deleting tariff:', error);
          this.isLoading = false;
          alert('Помилка видалення тарифу. Спробуйте пізніше.');
        });
    }
  }

  clearFilters(): void {
    this.filterForm.reset({
      nameContains: '',
      priceFrom: null,
      priceTo: null,
      internetSpeedMbitsFrom: null,
      internetSpeedMbitsTo: null,
      locationTypeIds: [],
      internetTariffStatusIds: []
    });
    this.loadTariffs();
  }
}