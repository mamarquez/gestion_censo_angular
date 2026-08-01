import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-acciones-tabla',
  imports: [ButtonModule, RouterLink],
  templateUrl: 'acciones-tabla.component.html'
})
export class AccionesTablaComponent {
  @Input() editarRoute: any[] = [];
  @Input() activo = true;
  @Output() toggleEstado = new EventEmitter<void>();
  @Output() borrar = new EventEmitter<void>();
}
