import { Component } from '@angular/core';
import { AuthEmployeeService } from '../../../services/auth/auth-employee.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login-office-manager',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login-office-manager.component.html',
  styleUrl: './login-office-manager.component.css'
})
export class LoginOfficeManagerComponent {

  loginForm: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthEmployeeService,
    private router: Router) 
  {
    this.loginForm = this.fb.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    const dto = {
      userName: this.loginForm.value.userName,
      password: this.loginForm.value.password
    }

    this.authService.login(dto).subscribe({
      next: (response) => {
        this.authService.saveLogin(response);
        this.router.navigateByUrl('/office-manager/purchases');
      },
      error: (error) => {
        alert('Сталася помилка. Перевірте свої автентифікаційні дані та спробуйте знову.');
        console.log(error);
      },
    });
  }

}
