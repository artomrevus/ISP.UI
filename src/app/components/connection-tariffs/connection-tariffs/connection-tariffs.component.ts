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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { debounceTime, Subject } from 'rxjs';
import {
  AddConnectionTariffDto,
  ConnectionTariffDto,
  ConnectionTariffFilterParameters,
  ConnectionTariffPaginationOptions,
  ConnectionTariffSortOptions
} from "../../../models/isp/connection-tariff.models";
import {ConnectionTariffsService} from "../../../services/isp/connection-tariffs.service";
import {DateFormatterService} from "../../../services/common/date-formatter.service";

@Component({
  selector: 'app-connection-tariffs',
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
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './connection-tariffs.component.html',
  styleUrls: ['./connection-tariffs.component.css']
})
export class ConnectionTariffsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'price', 'startDate', 'endDate', 'actions'];
  tariffs: ConnectionTariffDto[] = [];
  totalItems = 0;
  isLoading = false;

  filterForm: FormGroup;
  editForm: FormGroup;
  addForm: FormGroup;

  filter: ConnectionTariffFilterParameters = {};
  sort: ConnectionTariffSortOptions = { ascending: true };
  pagination: ConnectionTariffPaginationOptions = {
    pageSize: 10,
    pageNumber: 0,
    totalItems: 0
  };

  private filterSubject = new Subject<void>();

  editingId: number | null = null;
  isAddingNewRow = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) matSort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<ConnectionTariffDto>;

  constructor(
      private connectionTariffService: ConnectionTariffsService,
      private dateFormatterService: DateFormatterService,
      private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      nameContains: [null],
      priceFrom: [null],
      priceTo: [null],
      startDateFrom: [null],
      startDateTo: [null],
      endDateFrom: [null],
      endDateTo: [null]
    });

    this.editForm = this.fb.group({
      name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required]
    }, { validators: this.dateRangeValidator });

    this.addForm = this.fb.group({
      name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required]
    }, { validators: this.dateRangeValidator });
  }

  dateRangeValidator(formGroup: FormGroup) {
    const startDate = formGroup.get('startDate')?.value;
    const endDate = formGroup.get('endDate')?.value;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      formGroup.get('endDate')?.setErrors({ dateRange: true });
      return { dateRange: true };
    }

    return null;
  }

  ngOnInit(): void {
    this.loadTariffs();

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
      startDateFrom: this.formatDate(filterForm.startDateFrom),
      startDateTo: this.formatDate(filterForm.startDateTo),
      endDateFrom: this.formatDate(filterForm.endDateFrom),
      endDateTo: this.formatDate(filterForm.endDateTo)
    };

    this.connectionTariffService.getFiltered(
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

  startEdit(tariff: ConnectionTariffDto): void {
    this.editingId = tariff.id;

    this.editForm.setValue({
      name: tariff.name,
      price: tariff.price,
      startDate: tariff.startDate,
      endDate: tariff.endDate
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editForm.reset({
      name: '',
      price: null,
      startDate: null,
      endDate: null
    });
  }

  saveEdit(): void {
    if (this.editForm.invalid) {
      return;
    }

    const formValues = this.editForm.value;
    console.log('Form values before save:', formValues);

    const startDateStr = this.dateFormatterService.formatDate(formValues.startDate);
    const endDateStr = this.dateFormatterService.formatDate(formValues.endDate);

    if (!startDateStr || !endDateStr) {
      alert('Помилка форматування дат. Перевірте введені дані.');
      return;
    }

    const updatedTariff: ConnectionTariffDto = {
      id: this.editingId!,
      name: formValues.name,
      price: formValues.price,
      startDate: startDateStr,
      endDate: endDateStr
    };

    console.log('Saving tariff:', updatedTariff);

    this.isLoading = true;
    this.connectionTariffService.update(updatedTariff)
        .then(() => {
          console.log('Tariff updated successfully');
          this.editingId = null;
          this.editForm.reset({
            name: '',
            price: null,
            startDate: null,
            endDate: null
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
      startDate: null,
      endDate: null
    });
  }

  cancelAddNew(): void {
    this.isAddingNewRow = false;

    this.addForm.reset({
      name: '',
      price: null,
      startDate: null,
      endDate: null
    });
  }

  saveNewTariff(): void {
    if (this.addForm.invalid) {
      return;
    }

    const formValues = this.addForm.value;
    console.log('New tariff form values:', formValues);

    const startDateStr = this.dateFormatterService.formatDate(formValues.startDate);
    const endDateStr = this.dateFormatterService.formatDate(formValues.endDate);

    if (!startDateStr || !endDateStr) {
      alert('Помилка форматування дат. Перевірте введені дані.');
      return;
    }

    const newTariff: AddConnectionTariffDto = {
      name: formValues.name,
      price: formValues.price,
      startDate: startDateStr,
      endDate: endDateStr
    };

    console.log('Creating new tariff:', newTariff);

    this.isLoading = true;
    this.connectionTariffService.create(newTariff)
        .then(() => {
          console.log('Tariff created successfully');
          this.isAddingNewRow = false;

          this.addForm.reset({
            name: '',
            price: null,
            startDate: null,
            endDate: null
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
      this.connectionTariffService.delete(id)
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
      startDateFrom: null,
      startDateTo: null,
      endDateFrom: null,
      endDateTo: null
    });
    this.loadTariffs();
  }

  formatDate(date?: Date): string | undefined {
    if (!date){
      return undefined;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}