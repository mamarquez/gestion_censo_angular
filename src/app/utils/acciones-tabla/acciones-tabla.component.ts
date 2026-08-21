import { Component, EventEmitter, input, Input, output, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

/**
 * @version 1.0.2
 */

@Component({
  standalone: true,
  selector: 'app-acciones-tabla',
  imports: [
    ButtonModule,
    TooltipModule
  ],
  templateUrl: 'acciones-tabla.component.html'
})
export class AccionesTablaComponent {
  editarRoute = input<any[]>([]);
  editar = output<void>();
  activo = input<boolean | undefined>();
  visible = input<boolean | undefined>();
  toggleEstado = output<void>();
  toggleVisible = output<void>();
  borrar = output<void>();
}
