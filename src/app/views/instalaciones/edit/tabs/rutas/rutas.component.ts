import { ChangeDetectorRef, Component, DestroyRef, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { InstalacionRuta } from '../../../../../models/instalacionRuta';
import { ActivatedRoute } from '@angular/router';
import { InstalacionRutaService } from '../../../../../services/instalacionRuta.service';
import { DialogService } from '../../../../../services/dialog.service';
import { ApiResponseWrapper } from '../../../../../interface/api-response-wrapper.interface';
import { Truncar } from '../../../../../pipe/trucar.pipe';
import { AccionesTablaComponent } from '../../../../../utils/acciones-tabla/acciones-tabla.component';

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
    AccionesTablaComponent
  ],
  templateUrl: './rutas.component.html'
})
export class RutasComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InstalacionRutaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);

  @Output() cargandoChange = new EventEmitter<boolean>();

  private id: string | null = null;
  rutas: InstalacionRuta [] = [];
  cargando = false;
  guardando = false;

  form: FormGroup = this.fb.group({
    id: [''],
    nombre: ['', Validators.required],
    descripcion: [''],
    activo: [true]
  });

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');

    if (this.id) {
      this.cargarDatos(this.id);
    }
  }

  limpiar() {
    this.form.reset();
    this.form.patchValue({
      id: this.id
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
          id: this.id
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

  cambiarEstado(id: number) {
    this.cargando = true;

    this.service.cambiarEstado(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        const ruta = this.rutas.find(p => p.id === id);
        if (ruta) {
          ruta.activo = !ruta.activo;
        }

        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Se ha actualizado el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado del telefono', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el estado' });
        this.cargando = false;
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
      onAccept: () => this.borrarRegistro(ruta.id)
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

}
