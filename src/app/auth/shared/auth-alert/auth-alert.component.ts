import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

@Component({
  selector: 'app-auth-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-alert.component.html',
  styleUrl: './auth-alert.component.css'
})
export class AuthAlertComponent {

  @Input() type: AlertType = 'info';

  @Input() message = '';

  @Input() visible = false;

  get icon(): string {

    switch (this.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }

  }

}