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
  selector: 'app-network-technician-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterModule
  ],
  template: `
    <mat-toolbar color="primary" class="header">
      <div class="header-left">
        <a mat-button routerLink="/login" routerLinkActive="active-link" class="logo">ISP</a>
        <nav class="nav-links">
          <a mat-button routerLink="/network-technician/connections" routerLinkActive="active-link">Підключення</a>
          <a mat-button routerLink="/network-technician/monitoring" routerLinkActive="active-link">Моніторинг</a>
        </nav>
      </div>
      
      <div class="header-right">
        <span class="user-name">{{ employeeFullName }}</span>
        <button mat-icon-button aria-label="User menu" (click)="logout()">
          <mat-icon>logout</mat-icon>
        </button>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      padding: 0 16px;
      height: 64px;
    }
    
    .header-left, .header-right {
      display: flex;
      align-items: center;
    }

    .header-right {
      margin-right: 12px;
    }

    .logo {
      font-size: 24px;
      font-weight: bold;
      text-decoration: none;
      color: black;
      margin-right: 36px;
      letter-spacing: 1px;
    }
    
    .nav-links {
      display: flex;
      gap: 8px;
    }
    
    .active-link {
      background-color: rgba(255, 255, 255, 0.15);
    }
    
    .user-name {
      margin-right: 16px;
      font-weight: 500;
    }
    
    @media (max-width: 600px) {
      .user-name {
        display: none;
      }
      
      .nav-links {
        gap: 0;
      }
    }
  `]
})
export class NetworkTechnicianHeaderComponent implements OnInit {
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
      this.router.navigateByUrl('/network-technician/login');
      throw new Error('Login data is outdated or corrupted.');
    }

    return this.employeesService.getByIdFull(+savedLogin.employeeId);
  }
  
  logout(): void {
    this.authEmployeeService.logout();
    this.router.navigateByUrl('/login');
  }
}