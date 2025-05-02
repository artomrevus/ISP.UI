import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CopySnackbarComponent } from '../../components/common/copy-snackbar/copy-snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class CopyWindowService {
  constructor(private snackBar: MatSnackBar) {}

  showCopyWindow(data: string, durationInSeconds: number = 60) {
    this.snackBar.openFromComponent(CopySnackbarComponent, {
      data: data,
      duration: durationInSeconds * 1000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['copy-window-snackbar']
    });
  }
}