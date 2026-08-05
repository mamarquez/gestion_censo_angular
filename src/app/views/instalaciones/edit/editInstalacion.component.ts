import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { LoaderComponent } from '../../../layouts/loader/loader.component';
import { DatosComponent } from './tabs/datos/datos.component';
import { DatosTelefonosComponent } from './tabs/telefonos/telefonos.component';
import { DatosEspaciosDeportivosComponent } from './tabs/deportivos/deportivo.component';

@Component({
  standalone: true,
  selector: 'app-edit-instalaciones',
  imports: [
    TableModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    TooltipModule,
    DatosComponent,
    LoaderComponent,
    DatosTelefonosComponent,
    DatosEspaciosDeportivosComponent
  ],
  templateUrl: './editInstalacion.component.html',
  styleUrl: './editInstalacion.component.css'
})
export class EditInstalacionComponent {

  tabActiva: 'datos' | 'geoposicion' | 'telefonos' | 'deportivos' | 'fotos' = 'datos';
  cargando: boolean = false;

  seleccionarTab(tab: 'datos' | 'geoposicion' | 'telefonos' | 'deportivos' | 'fotos'): void {
    this.tabActiva = tab;
  }

  onCargandoChange(cargando: boolean): void {
    this.cargando = cargando;
  }
}
