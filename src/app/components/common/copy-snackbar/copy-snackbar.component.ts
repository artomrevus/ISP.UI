import { MAT_SNACK_BAR_DATA, MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'copy-snackbar',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './copy-snackbar.component.html',
  styleUrl: './copy-snackbar.component.css'
})
export class CopySnackbarComponent {
  constructor(
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    @Inject(MAT_SNACK_BAR_DATA) public data: string
  ) {}

  copyToClipboard() {
    this.clipboard.copy(this.data);
    this.snackBar.open('Скопійовано в буфер обміну!', 'OK', {
      duration: 2000,
    });
  }
}