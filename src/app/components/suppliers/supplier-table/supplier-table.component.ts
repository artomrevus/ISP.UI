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
  AddSupplierDto,
  SupplierDto,
  SupplierFilterParameters,
  SupplierPaginationOptions,
  SupplierSortOptions
} from "../../../models/isp/supplier.models";
import {SuppliersService} from "../../../services/isp/suppliers.service";

@Component({
  selector: 'app-supplier-table',
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
  templateUrl: './supplier-table.component.html',
  styleUrls: ['./supplier-table.component.css']
})
export class SupplierTableComponent implements OnInit {
  displayedColumns: string[] = ['name', 'phoneNumber', 'email', 'actions'];
  suppliers: SupplierDto[] = [];
  totalItems = 0;
  isLoading = false;

  filterForm: FormGroup;
  editForm: FormGroup;
  addForm: FormGroup;

  filter: SupplierFilterParameters = {};
  sort: SupplierSortOptions = { ascending: true };
  pagination: SupplierPaginationOptions = {
    pageSize: 5,
    pageNumber: 0,
    totalItems: 0
  };

  private filterSubject = new Subject<void>();

  editingId: number | null = null;
  isAddingNewRow = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) matSort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<SupplierDto>;

  constructor(
      private supplierService: SuppliersService,
      private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      name: [''],
      phoneNumber: [''],
      email: ['']
    });

    this.editForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.addForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.loadSuppliers();

    this.filterSubject
        .pipe(debounceTime(1000))
        .subscribe(() => {
          this.pagination.pageNumber = 0;
          if (this.paginator) {
            this.paginator.pageIndex = 0;
          }
          this.loadSuppliers();
        });

    this.filterForm.valueChanges.subscribe(() => {
      this.filterSubject.next();
    });
  }

  loadSuppliers(): void {
    this.isLoading = true;

    this.filter = {
      name: this.filterForm.get('name')?.value || undefined,
      phoneNumber: this.filterForm.get('phoneNumber')?.value || undefined,
      email: this.filterForm.get('email')?.value || undefined
    };

    this.supplierService.getFiltered(
        this.filter,
        this.sort,
        this.pagination.pageNumber + 1,
        this.pagination.pageSize
    ).then(result => {
      this.suppliers = result.items;
      this.totalItems = result.totalCount;
      this.pagination.totalItems = result.totalCount;
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading suppliers:', error);
      this.isLoading = false;
    });
  }

  onPageChange(event: PageEvent): void {
    this.pagination.pageSize = event.pageSize;
    this.pagination.pageNumber = event.pageIndex;
    this.loadSuppliers();
  }

  onSortChange(sortState: Sort): void {
    this.sort.sortBy = sortState.active;
    this.sort.ascending = sortState.direction === 'asc';
    this.loadSuppliers();
  }

  startEdit(supplier: SupplierDto): void {
    this.editingId = supplier.id;
    this.editForm.setValue({
      name: supplier.name,
      phoneNumber: supplier.phoneNumber,
      email: supplier.email
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editForm.reset();
  }

  saveEdit(): void {
    if (this.editForm.invalid) {
      return;
    }

    const updatedSupplier: SupplierDto = {
      id: this.editingId!,
      ...this.editForm.value
    };

    this.isLoading = true;
    this.supplierService.update(updatedSupplier).subscribe({
      next: () => {
        this.editingId = null;
        this.editForm.reset();
        this.loadSuppliers();
      },
      error: (error) => {
        console.error('Error updating supplier:', error);
        this.isLoading = false;
        alert('Помилка збереження змін. Змініть дані чи спробуйте пізніше.');
      }
    });
  }

  startAddNew(): void {
    this.isAddingNewRow = true;
    this.addForm.reset();
  }

  cancelAddNew(): void {
    this.isAddingNewRow = false;
    this.addForm.reset();
  }

  saveNewSupplier(): void {
    if (this.addForm.invalid) {
      return;
    }

    const newSupplier: AddSupplierDto = this.addForm.value;

    this.isLoading = true;
    this.supplierService.create(newSupplier).subscribe({
      next: () => {
        this.isAddingNewRow = false;
        this.addForm.reset();
        this.loadSuppliers();
      },
      error: (error) => {
        console.error('Error creating supplier:', error);
        this.isLoading = false;
        alert('Помилка збереження змін. Змініть дані чи спробуйте пізніше.');
      }
    });
  }

  deleteSupplier(id: number): void {
    if (confirm('Are you sure you want to delete this supplier?')) {
      this.isLoading = true;
      this.supplierService.delete(id)
          .then(() => {
            this.loadSuppliers();
          })
          .catch(error => {
            console.error('Error deleting supplier:', error);
            this.isLoading = false;
            alert('Помилка збереження змін. Змініть дані чи спробуйте пізніше.');
          });
    }
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.loadSuppliers();
  }
}