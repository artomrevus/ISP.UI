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
        component: ConnectionListComponent,
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
        component: VacancyListComponent,
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
        path: '**',
        redirectTo: 'login'
    },
];
