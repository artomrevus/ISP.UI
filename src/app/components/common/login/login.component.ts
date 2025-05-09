import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  
  constructor(private router: Router) {}
  
  navigateToRole(role: string): void {
    // Зберігаємо вибрану роль у localStorage для подальшого використання
    localStorage.setItem('selectedRole', role);
    
    // Перенаправляємо користувача на відповідну сторінку
    switch(role) {
      case 'technical':
        this.router.navigate(['network-technician/login']);
        break;
      case 'hr':
        this.router.navigate(['human-resource/login']);
        break;
      case 'warehouse':
        this.router.navigate(['warehouse-worker/login']);
        break;
      case 'manager':
        this.router.navigate(['office-manager/login']);
        break;
      case 'admin':
        this.router.navigate(['admin/login']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}