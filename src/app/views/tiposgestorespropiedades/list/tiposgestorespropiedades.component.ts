import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from '../../../services/dialog.service';
import { TipoGestorPropiedadService } from '../../../services/tipogestorpropiedad.service';
import { TipoGestorPropiedad } from '../../../models/tipogestorpropiedad';
import { mensajesUtil } from '../../../utils/mensajes.util';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';
import { EditModalComponent } from '../../../components/modal/edit-modal/edit-modal.component';
import { AccionesTablaComponent } from '../../../utils/acciones-tabla/acciones-tabla.component';

/**
 * @version 1.0.0
 */

@Component({
  standalone: true,
  selector: 'app-tipos-gestores-propiedades',
  imports: [TableModule, Button, InputText, ReactiveFormsModule, ConfirmDialogModule, EditModalComponent, AccionesTablaComponent],
  templateUrl: './tiposgestorespropiedades.component.html'
})
export class TiposGestoresPropiedadesComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(TipoGestorPropiedadService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);

  tipoGestorPropiedad: TipoGestorPropiedad | any = null;
  tiposGestoresPropiedades: TipoGestorPropiedad [] = [];
  cargando: boolean = true;
  modalVisible = false;

  form: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', Validators.required],
    mostrar: ['', Validators.required],
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
          this.tiposGestoresPropiedades = response.data;
        } else {
          this.tiposGestoresPropiedades = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando tipos gestores propiedades:', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cargando = false;
        this.tiposGestoresPropiedades = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        this.tiposGestoresPropiedades = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar tipos de gestores de propiedades', err);
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
        const tipoGestorPropiedad = this.tiposGestoresPropiedades.find(p => p.id === id);
        if (tipoGestorPropiedad) {
          tipoGestorPropiedad.activo = !tipoGestorPropiedad.activo;
        }

        mensajesUtil(this.messageService, 'success', 'update');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado de los tipos gestores propiedades', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(tipoGestorPropiedad: TipoGestorPropiedad): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${tipoGestorPropiedad.nombre}"</strong>?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(tipoGestorPropiedad.id)
    });
  }

  private borrarRegistro(id: number) {
    this.cargando = true;

    this.service.borrarRegistro(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        this.tiposGestoresPropiedades = this.tiposGestoresPropiedades.filter(p => p.id !== id);
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

    this.cargando = false;
  }

  abrirModal(): void {
    this.tipoGestorPropiedad = null;
    this.modalVisible = true;
  }

  editar(id: string) {
    this.service.get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response: ApiResponseWrapper<TipoGestorPropiedad>) => {
        this.tipoGestorPropiedad = response.data || [];

        if (this.tipoGestorPropiedad) {
          this.modalVisible = true;
        }
      },
      error: (err) => {
        console.error('Error al editar: ', err);
        mensajesUtil(this.messageService, 'errpr', 'carga');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardar(tipoGestorPropiedad: TipoGestorPropiedad) {
    this.cargando = true;

    const datos: TipoGestorPropiedad = {
      id: tipoGestorPropiedad.id,
      nombre: tipoGestorPropiedad.nombre,
      mostrar: tipoGestorPropiedad.mostrar,
      activo: tipoGestorPropiedad.activo
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
          console.error('Error al actualizar nivel educativo', err);
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
