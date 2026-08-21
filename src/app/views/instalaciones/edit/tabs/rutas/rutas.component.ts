import { ChangeDetectorRef, Component, DestroyRef, EventEmitter, inject, model, OnInit, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { InstalacionRuta } from '../../../../../models/instalacionRuta';
import { Router } from '@angular/router';
import { InstalacionRutaService } from '../../../../../services/instalacionRuta.service';
import { InstalacionRutaCoordenadaService } from '../../../../../services/instalacionRutaCoordenada.service';
import { DialogService } from '../../../../../services/dialog.service';
import { ApiResponseWrapper } from '../../../../../interface/api-response-wrapper.interface';
import { Truncar } from '../../../../../pipe/trucar.pipe';
import { AccionesTablaComponent } from '../../../../../utils/acciones-tabla/acciones-tabla.component';
import { MapaRutaComponent, PuntoRuta } from '../../../../../components/mapa-ruta/mapa-ruta.component';

@Component({
  standalone: true,
  selector: 'app-datos-rutas',
  imports: [
    Button,
    InputText,
    ReactiveFormsModule,
    PrimeTemplate,
    TableModule,
    Truncar,
    AccionesTablaComponent,
    MapaRutaComponent
  ],
  templateUrl: './rutas.component.html'
})
export class RutasComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InstalacionRutaService);
  private readonly coordenadaService = inject(InstalacionRutaCoordenadaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);

  idInstalacion = model.required<string>();
  @Output() cargandoChange = new EventEmitter<boolean>();

  rutas: InstalacionRuta [] = [];
  cargando = false;
  guardando = false;

  puntosPorRuta: Record<number, PuntoRuta[]> = {};
  cargandoPuntos: Record<number, boolean> = {};
  expandedRowKeys: Record<string, boolean> = {};

  form: FormGroup = this.fb.group({
    idInstalacion: [null],
    nombre: ['', Validators.required],
    descripcion: [null]
  });

  ngOnInit() {
    if (this.idInstalacion()) {
      this.cargarDatos(this.idInstalacion());
    }
  }

  limpiar() {
    this.form.reset();
    this.form.patchValue({
      idInstalacion: this.idInstalacion()
    });
    this.buscar();
  }

  buscar() {
    const filtros = this.form.value;
    this.cargando = true;

    this.service.getAll(filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        if (response && Array.isArray(response.data)) {
          this.rutas = response.data;
        } else {
          this.rutas = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar'
        });
        this.cargando = false;
        this.rutas = [];
      }
    });
  }

  private cargarDatos(id: string): void {
    this.cargando = true;
    this.cargandoChange.emit(true);
    this.cdr.detectChanges();

    this.service.getAll({ idInstalacion: id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response: ApiResponseWrapper<InstalacionRuta[]>) => {
        this.rutas = response.data ?? [];

        this.form.patchValue({
          idInstalacion: this.idInstalacion()
        });

        this.cargando = false;
        this.cargandoChange.emit(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar datos', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar datos de instalaciones'
        });
        this.cargando = false;
        this.cargandoChange.emit(false);
        this.cdr.detectChanges();
      }
    });
  }

  nuevo(): void {
    this.router.navigate(['/instalacionesrutas', 'nuevo'], {
      queryParams: { idInstalacion: this.idInstalacion() }
    });
  }

  editar(id: number): void {
    this.router.navigate(['/instalacionesrutas', id]);
  }

  cargarPuntosRuta(ruta: InstalacionRuta): void {
    if (!ruta.id || this.puntosPorRuta[ruta.id]) {
      return;
    }

    this.cargandoPuntos[ruta.id] = true;

    this.coordenadaService.getAll({ idRuta: ruta.id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        this.puntosPorRuta[ruta.id as number] = (response.data ?? []).map(c => ({
          id: c.id,
          x: c.x,
          y: c.y
        }));
        this.cargandoPuntos[ruta.id as number] = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar las coordenadas de la ruta', err);
        this.puntosPorRuta[ruta.id as number] = [];
        this.cargandoPuntos[ruta.id as number] = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarVisible(id: number) {
    this.cargando = true;

    this.service.cambiarVisible(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        const ruta = this.rutas.find(p => p.id === id);
        if (ruta) {
          ruta.visible = !ruta.visible;
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Actualizado',
          detail: 'Se ha actualizado la visibilidad'
        });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar la visibilidad del telefono', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar la visibilidad' });
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(ruta: InstalacionRuta): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar el teléfono "<strong>${ruta.nombre}</strong>"?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(Number(ruta.id))
    });
  }

  private borrarRegistro(id: number): void {
    this.service.borrarRegistro(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        this.rutas = this.rutas.filter(t => t.id !== id);
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: 'Se ha borrado correctamente'
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al borrar el registro', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al borrar el registro' });
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    console.log('Archivo seleccionado:', input.files?.[0]);

    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      // 1. Cuando termine de leer el archivo, guarda el Base64 en el formulario
      reader.onload = () => {
        console.log('Archivo leído, Base64:', reader.result);
      };

      reader.readAsDataURL(file);
    }

    console.log(event);
  }

}
