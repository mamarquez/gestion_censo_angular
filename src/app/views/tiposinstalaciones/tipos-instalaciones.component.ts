import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from '../../services/dialog.service';
import { TipoInstalacionService } from '../../services/tipo-instalacion.service';
import { TipoInstalacion } from '../../models/tipo-instalacion';
import { mensajesUtil } from '../../utils/mensajes.util';
import { ApiResponseWrapper } from '../../interface/api-response-wrapper.interface';
import { EditModalComponent } from '../../components/modal/edit-modal/edit-modal.component';
import { AccionesTablaComponent } from '../../utils/acciones-tabla/acciones-tabla.component';
import { BotonAddComponent } from '../../components/boton-add/boton-add.component';
import { FilasAutoajustablesDirective, opcionesFilasPorPagina } from '../../utils/filas-autoajustables.directive';

/**
 * @version 1.0.0
 */

@Component({
  standalone: true,
  selector: 'app-tipos-instalaciones',
  imports: [
    TableModule,
    Button,
    InputText,
    ReactiveFormsModule,
    ConfirmDialogModule,
    EditModalComponent,
    AccionesTablaComponent,
    BotonAddComponent,
    FilasAutoajustablesDirective
  ],
  templateUrl: './tipos-instalaciones.component.html'
})
export class TiposInstalacionesComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(TipoInstalacionService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);

  tipoInstalacion: TipoInstalacion | null = null;
  tiposInstalaciones: TipoInstalacion [] = [];
  cargando: boolean = true;
  modalVisible = false;
  filasPorPagina = 10;

  get opcionesFilasPorPagina(): number[] {
    return opcionesFilasPorPagina(this.filasPorPagina);
  }

  form: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', Validators.required],
    descripcion: [null],
    valor: ['', Validators.required],
    activo: [true]
  });

  ngOnInit(): void {
    this.cargar();
  }

  limpiar(): void {
    this.form.reset();
    this.buscar();
  }

  buscar(): void {
    const filtros = this.form.value;
    this.cargando = true;

    this.service.getAll(filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        if (response && Array.isArray(response.data)) {
          this.tiposInstalaciones = response.data;
        } else {
          this.tiposInstalaciones = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando tipos instalaciones:', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cargando = false;
        this.tiposInstalaciones = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        this.tiposInstalaciones = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar tipos de instalaciones', err);
        mensajesUtil(this.messageService, 'error', 'cargar');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): void {
    this.cargando = true;

    this.service.cambiarEstado(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        const tipoInstalacion = this.tiposInstalaciones.find(p => p.id === id);
        if (tipoInstalacion) {
          tipoInstalacion.activo = !tipoInstalacion.activo;
        }

        mensajesUtil(this.messageService, 'success', 'update');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado de los tipos instalaciones', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(tipoInstalacion: TipoInstalacion): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${tipoInstalacion.nombre}"</strong>?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(Number(tipoInstalacion.id))
    });
  }

  private borrarRegistro(id: number) {
    this.cargando = true;

    this.service.borrarRegistro(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        this.tiposInstalaciones = this.tiposInstalaciones.filter(p => p.id !== id);
        mensajesUtil(this.messageService, 'success', 'delete');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al borrar el registro', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModal(): void {
    this.tipoInstalacion = null;
    this.modalVisible = true;
  }

  editar(id: string) {
    this.service.get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response: ApiResponseWrapper<TipoInstalacion>) => {
        this.tipoInstalacion = response.data ?? null;

        if (this.tipoInstalacion) {
          this.modalVisible = true;
        }
      },
      error: (err) => {
        console.error('Error al editar: ', err);
        mensajesUtil(this.messageService, 'error', 'carga');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardar(tipoInstalacion: TipoInstalacion) {
    this.cargando = true;

    const datos: TipoInstalacion = {
      id: tipoInstalacion.id,
      nombre: tipoInstalacion.nombre,
      descripcion: tipoInstalacion.descripcion,
      valor: tipoInstalacion.valor,
      activo: tipoInstalacion.activo
    };

    if (datos.id) {
      this.service.updateRegistro(datos)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
        next: () => {
          mensajesUtil(this.messageService, 'success', 'update');
          this.modalVisible = false;
          this.cargando = false;
          this.cargar();
        },
        error: (err) => {
          console.error('Error al actualizar tipo de instalación', err);
          mensajesUtil(this.messageService, 'error', 'error');
          this.cargando = false;
        }
      });
    } else {
      this.service.addRegistro(datos)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
        next: () => {
          mensajesUtil(this.messageService, 'success', 'add');
          this.modalVisible = false;
          this.cargando = false;
          this.cargar();
        },
        error: (err) => {
          console.error('Error al añadir registro', err);
          mensajesUtil(this.messageService, 'error', 'error');
          this.cargando = false;
        }
      });
    }
  }

}
