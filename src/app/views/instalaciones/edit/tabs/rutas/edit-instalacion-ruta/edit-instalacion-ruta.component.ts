import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { concat } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Fieldset } from 'primeng/fieldset';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { InstalacionRutaService } from '../../../../../../services/instalacionRuta.service';
import { InstalacionRutaCoordenadaService } from '../../../../../../services/instalacionRutaCoordenada.service';
import { InstalacionRuta } from '../../../../../../models/instalacionRuta';
import { InstalacionRutaCoordenada } from '../../../../../../models/instalacionRutaCoordenada';
import { DialogService } from '../../../../../../services/dialog.service';
import { ApiResponseWrapper } from '../../../../../../interface/api-response-wrapper.interface';
import { AccionesTablaComponent } from '../../../../../../utils/acciones-tabla/acciones-tabla.component';
import { ModalCoordenadaComponent } from '../../../../../../components/ruta/modal-coordenada/modal-coordenada.component';
import { LoaderComponent } from '../../../../../../layouts/loader/loader.component';
import { MapaRutaComponent, PuntoRuta } from '../../../../../../components/mapa-ruta/mapa-ruta.component';
import { mensajesUtil } from '../../../../../../utils/mensajes.util';

/**
 * @version 1.0.1
 */

@Component({
  standalone: true,
  selector: 'app-edit-instalacion-ruta',
  imports: [
    ReactiveFormsModule,
    InputText,
    Button,
    Fieldset,
    TableModule,
    AccionesTablaComponent,
    ModalCoordenadaComponent,
    LoaderComponent,
    MapaRutaComponent
  ],
  templateUrl: './edit-instalacion-ruta.component.html',
  styleUrl: './edit-instalacion-ruta.component.css'
})
export class EditInstalacionRutaComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InstalacionRutaService);
  private readonly coordenadaService = inject(InstalacionRutaCoordenadaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('mapaRuta') private mapaRuta?: MapaRutaComponent;

  idRuta: number | null = null;
  cargando = false;
  guardando = false;
  coordenadas: InstalacionRutaCoordenada[] = [];
  cargandoCoordenadas = false;
  modalVisible = false;
  coordenadaSeleccionada: InstalacionRutaCoordenada | null = null;
  procesandoCoordenada = false;
  ruta: InstalacionRuta | null = null;
  private idInstalacion: number | null = null;

  form: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', Validators.required],
    descripcion: [null],
    visible: [true]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam && idParam !== 'nuevo') {
      this.idRuta = Number(idParam);
      this.cargar(this.idRuta);
      this.cargarCoordenadas(this.idRuta);
    } else {
      const idInstalacionParam = this.route.snapshot.queryParamMap.get('idInstalacion');
      this.idInstalacion = idInstalacionParam ? Number(idInstalacionParam) : null;
    }
  }

  private cargar(id: number): void {
    this.cargando = true;

    this.service.get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: ApiResponseWrapper<InstalacionRuta>) => {
          const ruta = response.data;

          if (ruta) {
            this.idInstalacion = ruta.idInstalacion ?? null;
            this.form.patchValue(ruta);
            this.ruta = ruta;
          }

          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar la ruta', err);
          mensajesUtil(this.messageService, 'error', 'carga');
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
  }

  private cargarCoordenadas(idRuta: number): void {
    this.cargandoCoordenadas = true;

    this.coordenadaService.getAll({ idRuta })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: ApiResponseWrapper<InstalacionRutaCoordenada[]>) => {
          this.coordenadas = response.data || [];
          this.actualizarPuntosMapa();
          this.cargandoCoordenadas = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar las coordenadas', err);
          mensajesUtil(this.messageService, 'error', 'error');
          this.coordenadas = [];
          this.actualizarPuntosMapa();
          this.cargandoCoordenadas = false;
          this.cdr.detectChanges();
        }
      });
  }

  guardar(): void {
    if (this.form.invalid || !this.idInstalacion) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;

    const ruta = this.form.value;

    for (const campo in ruta) {
      if (typeof ruta[campo] === 'string' && !ruta[campo].trim()) {
        ruta[campo] = null;
      }
    }

    if (this.idRuta) {
      this.service.actualizar(this.idRuta, this.idInstalacion, ruta)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            mensajesUtil(this.messageService, 'success', 'update');
            this.guardando = false;
            this.cargar(this.idRuta as number);
            this.cargarCoordenadas(this.idRuta as number);
          },
          error: (err) => {
            console.error('Error al guardar la ruta', err);
            mensajesUtil(this.messageService, 'error', 'error');
            this.guardando = false;
            this.cdr.detectChanges();
          }
        });
    } else {
      this.service.crear({ idInstalacion: this.idInstalacion, ...ruta })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            mensajesUtil(this.messageService, 'success', 'add');
            this.guardando = false;
            this.router.navigate(['/instalaciones', this.idInstalacion], { queryParams: { tab: 'rutas' } });
          },
          error: (err) => {
            console.error('Error al crear la ruta', err);
            mensajesUtil(this.messageService, 'error', 'error');
            this.guardando = false;
            this.cdr.detectChanges();
          }
        });
    }
  }

  abrirModalNuevaCoordenada(): void {
    this.coordenadaSeleccionada = null;
    this.modalVisible = true;
  }

  abrirModalEditarCoordenada(coordenada: InstalacionRutaCoordenada): void {
    this.coordenadaSeleccionada = coordenada;
    this.modalVisible = true;
  }

  coordenadaGuardada(): void {
    if (this.idRuta) {
      this.cargarCoordenadas(this.idRuta);
      this.recargarDatosCalculados(this.idRuta);
    }
  }

  private recargarDatosCalculados(id: number): void {
    this.service.get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: ApiResponseWrapper<InstalacionRuta>) => {
          this.ruta = response.data ?? null;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error al recalcular los datos de la ruta', err)
      });
  }

  puntosMapa: PuntoRuta[] = [];

  private actualizarPuntosMapa(): void {
    this.puntosMapa = [...this.coordenadas]
      .sort((a, b) => (a.id as number) - (b.id as number))
      .map(c => ({ id: c.id, x: c.x, y: c.y }));
  }

  agregarCoordenadaDesdeMapa(puntos: PuntoRuta[]): void {
    if (!this.idRuta || puntos.length === 0 || this.procesandoCoordenada) {
      return;
    }

    const nuevoPunto = puntos[puntos.length - 1];

    this.procesandoCoordenada = true;
    this.mapaRuta?.setBloqueado(true);

    this.coordenadaService.crear(this.idRuta, nuevoPunto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          mensajesUtil(this.messageService, 'success', 'add');

          if (this.idRuta) {
            this.cargarCoordenadasTabla(this.idRuta, true);
            this.recargarDatosCalculados(this.idRuta);
          }

          this.procesandoCoordenada = false;
          this.mapaRuta?.setBloqueado(false);
        },
        error: (err) => {
          console.error('Error al añadir la coordenada desde el mapa', err);
          mensajesUtil(this.messageService, 'error', 'error');
          this.procesandoCoordenada = false;
          this.mapaRuta?.setBloqueado(false);
        }
      });
  }

  private cargarCoordenadasTabla(idRuta: number, esCreacion: boolean = false): void {
    this.coordenadaService.getAll({ idRuta })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: ApiResponseWrapper<InstalacionRutaCoordenada[]>) => {
          this.coordenadas = response.data || [];
          this.actualizarPuntosMapa();

          if (esCreacion && this.coordenadas.length > 0) {
            const creada = this.coordenadas.reduce((max, c) =>
              (c.id as number) > (max.id as number) ? c : max
            );

            this.mapaRuta?.asignarIdUltimoPunto(creada.id as number);
          }

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al refrescar las coordenadas', err);
        }
      });
  }

  confirmarBorradoCoordenada(coordenada: InstalacionRutaCoordenada): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar la coordenada "<strong>${coordenada.x}, ${coordenada.y}</strong>"?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarCoordenada(coordenada.id as number)
    });
  }

  private borrarCoordenada(id: number): void {
    this.procesandoCoordenada = true;
    this.mapaRuta?.setBloqueado(true);
    this.cdr.detectChanges();

    this.coordenadaService.borrarRegistro(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.coordenadas = this.coordenadas.filter(c => c.id !== id);
          this.actualizarPuntosMapa();
          mensajesUtil(this.messageService, 'success', 'delete');

          if (this.idRuta) {
            this.recargarDatosCalculados(this.idRuta);
          }

          this.procesandoCoordenada = false;
          this.cdr.detectChanges();

          setTimeout(() => this.mapaRuta?.setBloqueado(false));
        },
        error: (err) => {
          console.error('Error al borrar la coordenada', err);
          mensajesUtil(this.messageService, 'error', 'error');
          this.procesandoCoordenada = false;
          this.mapaRuta?.setBloqueado(false);
          this.cdr.detectChanges();
        }
      });
  }

  deshacerUltimoPunto(): void {
    if (this.coordenadas.length === 0 || this.procesandoCoordenada) {
      return;
    }

    const ultima = this.coordenadas.reduce((max, c) =>
      (c.id as number) > (max.id as number) ? c : max
    );

    this.borrarCoordenada(ultima.id as number);
  }

  confirmarBorrarTodasCoordenadas(): void {
    if (this.coordenadas.length === 0) {
      return;
    }

    this.dialog.confirmar({
      mensaje: '¿Deseas eliminar <strong>todas</strong> las coordenadas de esta ruta?',
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar todas',
      onAccept: () => this.borrarTodasCoordenadas()
    });
  }

  private borrarTodasCoordenadas(): void {
    const idsABorrar = this.coordenadas.map(c => c.id as number);

    if (idsABorrar.length === 0) {
      return;
    }

    this.procesandoCoordenada = true;
    this.mapaRuta?.setBloqueado(true);

    concat(...idsABorrar.map(id => this.coordenadaService.borrarRegistro(id)))
      .pipe(toArray(), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.coordenadas = [];
          this.actualizarPuntosMapa();
          this.mapaRuta?.limpiarRuta(false);
          mensajesUtil(this.messageService, 'success', 'delete');

          if (this.idRuta) {
            this.recargarDatosCalculados(this.idRuta);
          }

          this.procesandoCoordenada = false;
          this.cdr.detectChanges();
          setTimeout(() => this.mapaRuta?.setBloqueado(false));
        },
        error: (err) => {
          console.error('Error al borrar todas las coordenadas', err);
          mensajesUtil(this.messageService, 'error', 'error');
          this.procesandoCoordenada = false;
          this.mapaRuta?.setBloqueado(false);

          if (this.idRuta) {
            this.cargarCoordenadas(this.idRuta);
          }
        }
      });
  }

  cancelar(): void {
    if (this.idInstalacion === null) {
      return;
    }

    this.router.navigate(['/instalaciones', this.idInstalacion], { queryParams: { tab: 'rutas' } });
  }

}
