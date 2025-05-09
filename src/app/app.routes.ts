import { Routes } from '@angular/router';
import { LoginNetworkTechnicianComponent } from './components/network-technician/login-network-technician/login-network-technician.component';
import { ConnectionListComponent } from './components/connections/connection-list/connection-list.component';
import { authNetworkTechnicianGuard } from './guards/auth-network-technician.guard';
import { NetworkTechnicianMonitoringComponent } from './components/network-technician/network-technician-monitoring/network-technician-monitoring.component';
import { LoginComponent } from './components/common/login/login.component';
import { LoginHumanResourceComponent } from './components/human-resource/login-human-resource/login-human-resource.component';
import { VacancyListComponent } from './components/vacancies/vacancy-list/vacancy-list.component';
import { authHumanResourceGuard } from './guards/auth-human-resource.guard';
import { HumanResourceMonitoringComponent } from './components/human-resource/human-resource-monitoring/human-resource-monitoring.component';
import { LoginOfficeManagerComponent } from './components/office-manager/login-office-manager/login-office-manager.component';
import {PurchaseListComponent} from "./components/purchases/purchase-list/purchase-list.component";
import {authOfficeManagerGuard} from "./guards/auth-office-manager.guard";
import {
    NetworkTechnicianConnectionsComponent
} from "./components/network-technician/network-technician-connections/network-technician-connections.component";
import {
    HumanResourceVacanciesComponent
} from "./components/human-resource/human-resource-vacancies/human-resource-vacancies.component";
import {
    OfficeManagerPurchasesComponent
} from "./components/office-manager/office-manager-purchases/office-manager-purchases.component";
import {
    LoginWarehouseWorkerComponent
} from "./components/warehouse-worker/login-warehouse-worker/login-warehouse-worker.component";
import {
    WarehouseWorkerPlacementsComponent
} from "./components/warehouse-worker/warehouse-worker-placements/warehouse-worker-placements.component";
import {authWarehouseWorkerGuard} from "./guards/auth-warehouse-worker.guard";
import {
    OfficeManagerMonitoringComponent
} from "./components/office-manager/office-manager-monitoring/office-manager-monitoring.component";
import {
    WarehouseWorkerMonitoringComponent
} from "./components/warehouse-worker/warehouse-worker-monitoring/warehouse-worker-monitoring.component";
import {LoginAdminComponent} from "./components/admin/login-admin/login-admin.component";
import {AdminMonitoringComponent} from "./components/admin/admin-monitoring/admin-monitoring.component";
import {authAdminGuard} from "./guards/auth-admin.guard";

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    { 
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'network-technician/login',
        component: LoginNetworkTechnicianComponent
    },
    {
        path: 'network-technician/connections',
        component: NetworkTechnicianConnectionsComponent,
        canActivate: [authNetworkTechnicianGuard]
    },
    { 
        path: 'network-technician/monitoring',
        component: NetworkTechnicianMonitoringComponent,
        canActivate: [authNetworkTechnicianGuard]
    },
    {
        path: 'human-resource/login',
        component: LoginHumanResourceComponent
    },
    {
        path: 'human-resource/vacancies',
        component: HumanResourceVacanciesComponent,
        canActivate: [authHumanResourceGuard]
    },
    { 
        path: 'human-resource/monitoring',
        component: HumanResourceMonitoringComponent,
        canActivate: [authHumanResourceGuard]
    },
    {
        path: 'office-manager/login',
        component: LoginOfficeManagerComponent
    },
    {
        path: 'office-manager/purchases',
        component: OfficeManagerPurchasesComponent,
        canActivate: [authOfficeManagerGuard]
    },
    {
        path: 'office-manager/monitoring',
        component: OfficeManagerMonitoringComponent,
        canActivate: [authOfficeManagerGuard]
    },
    {
        path: 'warehouse-worker/login',
        component: LoginWarehouseWorkerComponent
    },
    {
        path: 'warehouse-worker/placements',
        component: WarehouseWorkerPlacementsComponent,
        canActivate: [authWarehouseWorkerGuard]
    },
    {
        path: 'warehouse-worker/monitoring',
        component: WarehouseWorkerMonitoringComponent,
        canActivate: [authWarehouseWorkerGuard]
    },
    {
        path: 'admin/login',
        component: LoginAdminComponent
    },
    {
        path: 'admin/monitoring',
        component: AdminMonitoringComponent,
        canActivate: [authAdminGuard]
    },
    {
        path: '**',
        redirectTo: 'login'
    },
];
