import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import {DateFormatterService} from "../../../services/common/date-formatter.service";
import {PurchaseFilterParameters, PurchaseSortOptions} from "../../../models/isp/purchase.models";
import {PurchaseStatusDto} from "../../../models/isp/purchase-statuses.models";
import {SupplierDto} from "../../../models/isp/supplier.models";
import {PurchaseStatusesService} from "../../../services/isp/purchase-statuses.service";
import {SuppliersService} from "../../../services/isp/suppliers.service";

interface PurchaseStatus {
    id: number;
    name: string;
}

interface Supplier {
    id: number;
    name: string;
}

@Component({
    selector: 'app-purchase-filter-panel',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
        MatIconModule,
        MatExpansionModule,
        MatChipsModule,
        MatTooltipModule
    ],
    templateUrl: './purchase-filter-panel.component.html',
    styleUrl: './purchase-filter-panel.component.css'
})
export class PurchaseFilterPanelComponent implements OnInit {
    // Filters data
    purchaseStatuses: PurchaseStatusDto[] = [];
    suppliers: SupplierDto[] = [];

    // Filters output event
    @Output() filtersChanged = new EventEmitter<any>();
    @Output() closeRequest = new EventEmitter<void>();

    filterForm: FormGroup;

    get activeFiltersCount(): number {
        let count = 0;

        const form = this.filterForm.value;

        if (form.purchaseStatusIds?.length) count += form.purchaseStatusIds.length;
        if (form.supplierIds?.length) count += form.supplierIds.length;
        if (form.numberContains) count += 1;
        if (form.dateFrom) count += 1;
        if (form.dateTo) count += 1;
        if (form.totalPriceFrom) count += 1;
        if (form.totalPriceTo) count += 1;
        if (form.purchaseEquipmentsCountFrom) count += 1;
        if (form.purchaseEquipmentsCountTo) count += 1;

        return count;
    }

    constructor(
        private dateFormatter: DateFormatterService,
        private purchaseStatusesService: PurchaseStatusesService,
        private suppliersService: SuppliersService,
        private fb: FormBuilder) {
        this.filterForm = this.fb.group({
            purchaseStatusIds: [[]],
            supplierIds: [[]],
            numberContains: [''],
            dateFrom: [null],
            dateTo: [null],
            totalPriceFrom: [null],
            totalPriceTo: [null],
            purchaseEquipmentsCountFrom: [null],
            purchaseEquipmentsCountTo: [null],
            sortBy: ['purchaseDate'],
            ascending: [false]
        });
    }

    ngOnInit(): void {
        this.loadPurchaseStatuses();
        this.loadSuppliers();
    }

    async loadPurchaseStatuses() {
        this.purchaseStatuses = await this.purchaseStatusesService.get();
    }

    async loadSuppliers() {
        this.suppliers = await this.suppliersService.get();
    }

    applyFilters(): void {
        const filters = this.prepareFilters();
        this.filtersChanged.emit(filters);
    }

    resetFilters(): void {
        this.filterForm.reset({
            purchaseStatusIds: [],
            supplierIds: [],
            numberContains: '',
            dateFrom: null,
            dateTo: null,
            totalPriceFrom: null,
            totalPriceTo: null,
            purchaseEquipmentsCountFrom: null,
            purchaseEquipmentsCountTo: null,
            sortBy: 'purchaseDate',
            ascending: false
        });
    }

    removeFilter(controlName: string, value?: any): void {
        const control = this.filterForm.get(controlName);
        if (!control) return;

        if (Array.isArray(control.value) && value !== undefined) {
            const newValue = control.value.filter((v: any) => v !== value);
            control.setValue(newValue);
        } else {
            control.setValue(controlName.includes('Date') ? null : '');
        }
    }

    closePanel(): void {
        this.closeRequest.emit();
    }

    // Methods to get selected elements to show chips
    getSelectedPurchaseStatuses(): PurchaseStatusDto[] {
        const selectedIds = this.filterForm.get('purchaseStatusIds')?.value || [];
        return this.purchaseStatuses.filter(item => selectedIds.includes(item.id));
    }

    getSelectedSuppliers(): SupplierDto[] {
        const selectedIds = this.filterForm.get('supplierIds')?.value || [];
        return this.suppliers.filter(item => selectedIds.includes(item.id));
    }

    formatDate(date: Date): string {
        if (!date) return '';
        return new Date(date).toLocaleDateString();
    }

    prepareFilters(): {filters: PurchaseFilterParameters, sorting: PurchaseSortOptions} {
        const formValue = this.filterForm.value;

        let dateFrom = undefined;
        let dateTo = undefined;

        if (formValue.dateFrom) {
            dateFrom = this.dateFormatter.formatDate(formValue.dateFrom);
        }

        if (formValue.dateTo) {
            dateTo = this.dateFormatter.formatDate(formValue.dateTo);
        }

        return {
            filters: {
                purchaseStatusIds: formValue.purchaseStatusIds || [],
                supplierIds: formValue.supplierIds || [],
                numberContains: formValue.numberContains || undefined,
                dateFrom: dateFrom,
                dateTo: dateTo,
                totalPriceFrom: formValue.totalPriceFrom || undefined,
                totalPriceTo: formValue.totalPriceTo || undefined,
                purchaseEquipmentsCountFrom: formValue.purchaseEquipmentsCountFrom || undefined,
                purchaseEquipmentsCountTo: formValue.purchaseEquipmentsCountTo || undefined,
            },
            sorting: {
                sortBy: formValue.sortBy,
                ascending: formValue.ascending
            }
        };
    }
}