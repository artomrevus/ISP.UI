import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthEmployeeService } from '../../../services/auth/auth-employee.service';
import { EmployeesService } from '../../../services/isp/employees.service';
import { FullEmployee } from '../../../models/isp/employee.models';
import {RouterModule} from '@angular/router';

@Component({
    selector: 'app-office-manager-header',
    standalone: true,
    imports: [
        CommonModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        RouterModule
    ],
    templateUrl: './office-manager-header.component.html',
    styleUrl: './office-manager-header.component.css'
})
export class OfficeManagerHeaderComponent implements OnInit {
    employeeFullName: string = '';

    constructor(
        private router: Router,
        private authEmployeeService: AuthEmployeeService,
        private employeesService: EmployeesService,
    ) {}

    async ngOnInit(): Promise<void> {
        const employee = await this.getLoginedEmployee();
        this.employeeFullName = employee.firstName + ' ' + employee.lastName;
    }

    async getLoginedEmployee(): Promise<FullEmployee>{
        // Get current login data
        const savedLogin = this.authEmployeeService.getLogin();

        if(!savedLogin){
            this.router.navigateByUrl('/office-manager/login');
            throw new Error('Login data is outdated or corrupted.');
        }

        return this.employeesService.getByIdFull(+savedLogin.employeeId);
    }

    logout(): void {
        this.authEmployeeService.logout();
        this.router.navigateByUrl('/login');
    }
}