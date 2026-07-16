import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-button.component.html',
  styleUrl: './auth-button.component.css'
})
export class AuthButtonComponent {

  @Input() text = 'Aceptar';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  @Output() clicked = new EventEmitter<void>();

  onClick(): void {
    if (!this.loading && !this.disabled) {
      this.clicked.emit();
    }
  }

}