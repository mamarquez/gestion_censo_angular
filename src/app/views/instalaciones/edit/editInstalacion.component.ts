import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { DatosComponent } from './tabs/datos/datos.component';
import { DatosTelefonosComponent } from './tabs/telefonos/telefonos.component'

@Component({
  standalone: true,
  selector: 'app-edit-instalaciones',
  imports: [
    TableModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    TooltipModule,
    DatosComponent,
    DatosTelefonosComponent
  ],
  templateUrl: './editInstalacion.component.html',
  styleUrl: './editInstalacion.component.css'
})
export class EditInstalacionComponent {

  tabActiva: 'datos' | 'geoposicion' | 'telefonos' | 'fotos' = 'datos';
  cargando: boolean = false;

  seleccionarTab(tab: 'datos' | 'geoposicion' | 'telefonos' | 'fotos'): void {
    this.tabActiva = tab;
  }
}
