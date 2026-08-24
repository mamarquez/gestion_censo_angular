import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { LoaderComponent } from '../../../layouts/loader/loader.component';
import { DatosComponent } from './tabs/datos/datos.component';
import { DatosTelefonosComponent } from './tabs/telefonos/telefonos.component';
import { DatosEspaciosDeportivosComponent } from './tabs/deportivos/deportivo.component';
import { DatosCaracteristicaComponent } from './tabs/caracteristicas/caracteristica.component';
import { GeoPosicionComponent } from './tabs/geoposicion/geoposicion.component';
import { ComplementarioComponent } from './tabs/complementarios/complementario.component';
import { RutasComponent } from './tabs/rutas/rutas.component';

/**
 * @version 1.0.2
 */

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
    DatosEspaciosDeportivosComponent,
    DatosCaracteristicaComponent,
    ComplementarioComponent,
    GeoPosicionComponent,
    RutasComponent
  ],
  templateUrl: './editInstalacion.component.html',
  styleUrl: './editInstalacion.component.css'
})
export class EditInstalacionComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);

  tabActiva: 'datos' | 'geoposicion' | 'caracteristicas' | 'complementarios' | 'rutas' | 'telefonos' | 'deportivos' | 'fotos' = 'datos';
  cargando: boolean = false;

  idInstalacion = signal<string>('');

  ngOnInit(): void {
    this.idInstalacion.set(this.route.snapshot.paramMap.get('id') ?? '');

    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab === 'datos' || tab === 'geoposicion' || tab === 'caracteristicas' || tab === 'complementarios' || tab === 'rutas' || tab === 'telefonos' || tab === 'deportivos' || tab === 'fotos') {
      this.tabActiva = tab;
    }
  }

  seleccionarTab(tab: 'datos' | 'geoposicion' | 'caracteristicas' | 'complementarios' | 'rutas' | 'telefonos' | 'deportivos' | 'fotos'): void {
    this.tabActiva = tab;
  }

  onCargandoChange(cargando: boolean): void {
    Promise.resolve().then(() => {
      this.cargando = cargando;
    });
  }
}
