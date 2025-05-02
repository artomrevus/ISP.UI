import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthEmployeeService } from '../services/auth/auth-employee.service';
import { AuthRoles } from '../models/auth/auth-roles.model';

export const authNetworkTechnicianGuard: CanActivateFn = (route, state) => {
  // Injections 
  const router = inject(Router);
  const authService = inject(AuthEmployeeService);

  // Get login
  const loginData = authService.getLogin();

  // Check if valid
  if(loginData && authService.isLoginValid(loginData, AuthRoles.NETWORK_TECHNICIAN)) {
    return true;
  } else {
    alert("Будь ласка, увійдіть як технічний працівник.");
    authService.logout();
    router.navigateByUrl('/network-technician/login');
    return false;
  }
};