import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {RouterModule} from '@angular/router';
import {AuthAdminService} from "../../../services/auth/auth-admin.service";

@Component({
    selector: 'app-admin-header',
    standalone: true,
    imports: [
        CommonModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        RouterModule
    ],
    templateUrl: './admin-header.component.html',
    styleUrl: './admin-header.component.css'
})
export class AdminHeaderComponent {
    constructor(
        private router: Router,
        private authAdminService: AuthAdminService,
    ) {}

    logout(): void {
        this.authAdminService.logout();
        this.router.navigateByUrl('/login');
    }
}