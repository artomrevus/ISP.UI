import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthEmployeeService } from '../services/auth/auth-employee.service';
import { AuthRoles } from '../models/auth/auth-roles.model';
import {AuthAdminService} from "../services/auth/auth-admin.service";

export const authAdminGuard: CanActivateFn = (route, state) => {
  // Injections
  const router = inject(Router);
  const authService = inject(AuthAdminService);

  // Get login
  const loginData = authService.getLogin();

  // Check if valid
  if(loginData && authService.isLoginValid(loginData)) {
    return true;
  } else {
    alert("Будь ласка, увійдіть як адмін.");
    authService.logout();
    router.navigateByUrl('/admin/login');
    return false;
  }
};