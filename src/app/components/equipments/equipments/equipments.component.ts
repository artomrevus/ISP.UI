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
  AddEquipmentDto,
  FullEquipment,
  EquipmentDto,
  EquipmentFilterParameters,
  EquipmentPaginationOptions,
  EquipmentSortOptions
} from "../../../models/isp/equipment.models";
import { EquipmentsService } from "../../../services/isp/equipments.service";
import { EquipmentTypesService } from "../../../services/isp/equipment-types.service";
import { FullEquipmentType } from '../../../models/isp/equipment-type.models';

@Component({
  selector: 'app-equipments',
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
  templateUrl: './equipments.component.html',
  styleUrls: ['./equipments.component.css']
})
export class EquipmentsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'price', 'equipmentType', 'actions'];
  equipment: FullEquipment[] = [];
  totalItems = 0;
  isLoading = false;

  filterForm: FormGroup;
  editForm: FormGroup;
  addForm: FormGroup;

  filter: EquipmentFilterParameters = {
    equipmentTypeIds: []
  };
  sort: EquipmentSortOptions = { ascending: true };
  pagination: EquipmentPaginationOptions = {
    pageSize: 10,
    pageNumber: 0,
    totalItems: 0
  };

  private filterSubject = new Subject<void>();

  editingId: number | null = null;
  isAddingNewRow = false;

  equipmentTypes: FullEquipmentType[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) matSort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<FullEquipment>;

  constructor(
    private equipmentsService: EquipmentsService,
    private equipmentTypesService: EquipmentTypesService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      nameContains: [null],
      priceFrom: [null],
      priceTo: [null],
      equipmentTypeIds: [[]]
    });

    this.editForm = this.fb.group({
      name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      equipmentTypeId: [null, Validators.required]
    });

    this.addForm = this.fb.group({
      name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      equipmentTypeId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEquipment();
    this.loadEquipmentTypes();

    this.filterSubject
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.pagination.pageNumber = 0;
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
        this.loadEquipment();
      });

    this.filterForm.valueChanges.subscribe(() => {
      this.filterSubject.next();
    });
  }

  loadEquipment(): void {
    this.isLoading = true;

    const filterForm = this.filterForm.value;

    this.filter = {
      nameContains: filterForm.nameContains,
      priceFrom: filterForm.priceFrom,
      priceTo: filterForm.priceTo,
      equipmentTypeIds: filterForm.equipmentTypeIds || []
    };

    this.equipmentsService.getFilteredFull(
      this.filter,
      this.sort,
      this.pagination.pageNumber + 1,
      this.pagination.pageSize
    ).then(result => {
      this.equipment = result.items;
      this.totalItems = result.totalCount;
      this.pagination.totalItems = result.totalCount;
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading equipment:', error);
      this.isLoading = false;
      alert('Помилка завантаження даних. Спробуйте пізніше.');
    });
  }

  async loadEquipmentTypes() {
    this.equipmentTypes = await this.equipmentTypesService.get();
  }

  onPageChange(event: PageEvent): void {
    this.pagination.pageSize = event.pageSize;
    this.pagination.pageNumber = event.pageIndex;
    this.loadEquipment();
  }

  onSortChange(sortState: Sort): void {
    this.sort.sortBy = sortState.active;
    this.sort.ascending = sortState.direction === 'asc';
    this.loadEquipment();
  }

  startEdit(equipment: FullEquipment): void {
    this.editingId = equipment.id;

    this.editForm.setValue({
      name: equipment.name,
      price: equipment.price,
      equipmentTypeId: equipment.equipmentTypeId
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editForm.reset({
      name: '',
      price: null,
      equipmentTypeId: null
    });
  }

  saveEdit(): void {
    if (this.editForm.invalid) {
      return;
    }

    const formValues = this.editForm.value;
    console.log('Form values before save:', formValues);

    const updatedEquipment: EquipmentDto = {
      id: this.editingId!,
      name: formValues.name,
      price: formValues.price,
      equipmentTypeId: formValues.equipmentTypeId
    };

    console.log('Saving equipment:', updatedEquipment);

    this.isLoading = true;
    this.equipmentsService.update(updatedEquipment)
      .then(() => {
        console.log('Equipment updated successfully');
        this.editingId = null;
        this.editForm.reset({
          name: '',
          price: null,
          equipmentTypeId: null
        });
        this.loadEquipment();
      })
      .catch(error => {
        console.error('Error updating equipment:', error);
        this.isLoading = false;
        alert('Помилка збереження змін. Змініть дані чи спробуйте пізніше.');
      });
  }

  startAddNew(): void {
    this.isAddingNewRow = true;

    this.addForm.reset({
      name: '',
      price: null,
      equipmentTypeId: null
    });
  }

  cancelAddNew(): void {
    this.isAddingNewRow = false;

    this.addForm.reset({
      name: '',
      price: null,
      equipmentTypeId: null
    });
  }

  saveNewEquipment(): void {
    if (this.addForm.invalid) {
      return;
    }

    const formValues = this.addForm.value;
    console.log('New equipment form values:', formValues);

    const newEquipment: AddEquipmentDto = {
      name: formValues.name,
      price: formValues.price,
      equipmentTypeId: formValues.equipmentTypeId
    };

    console.log('Creating new equipment:', newEquipment);

    this.isLoading = true;
    this.equipmentsService.create(newEquipment)
      .then(() => {
        console.log('Equipment created successfully');
        this.isAddingNewRow = false;

        this.addForm.reset({
          name: '',
          price: null,
          equipmentTypeId: null
        });
        this.loadEquipment();
      })
      .catch(error => {
        console.error('Error creating equipment:', error);
        this.isLoading = false;
        alert('Помилка збереження змін. Змініть дані чи спробуйте пізніше.');
      });
  }

  deleteEquipment(id: number): void {
    if (confirm('Ви впевнені, що хочете видалити це обладнання?')) {
      this.isLoading = true;
      this.equipmentsService.delete(id)
        .then(() => {
          console.log('Equipment deleted successfully');
          this.loadEquipment();
        })
        .catch(error => {
          console.error('Error deleting equipment:', error);
          this.isLoading = false;
          alert('Помилка видалення обладнання. Спробуйте пізніше.');
        });
    }
  }

  clearFilters(): void {
    this.filterForm.reset({
      nameContains: '',
      priceFrom: null,
      priceTo: null,
      equipmentTypeIds: []
    });
    this.loadEquipment();
  }
}