import { ChangeDetectorRef, Component, DestroyRef, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { InstalacionTelefono } from '../../../../../models/instalaciontelefono';
import { InstalacionTelefonoService } from '../../../../../services/instalaciontelefono.service';
import { DialogService } from '../../../../../services/dialog.service';
import { TableModule } from 'primeng/table';
import { AccionesTablaComponent } from '../../../../../utils/acciones-tabla/acciones-tabla.component';
import { ApiResponseWrapper } from '../../../../../interface/api-response-wrapper.interface';
import { mensajesUtil } from '../../../../../utils/mensajes.util';
import { EditModalComponent } from '../../../../../components/modal/edit-modal/edit-modal.component';

/**
 * @version 1.0.1
 */

@Component({
  standalone: true,
  selector: 'app-datos-telefonos',
  imports: [
    CheckboxModule,
    ButtonModule,
    ToastModule,
    SelectModule,
    TableModule,
    AccionesTablaComponent,
    EditModalComponent
  ],
  providers: [MessageService],
  templateUrl: './telefonos.component.html'
})
export class DatosTelefonosComponent implements OnInit {

  private readonly service = inject(InstalacionTelefonoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);

  idInstalacion = input<string>();

  telefono: InstalacionTelefono | any = null;
  telefonos: InstalacionTelefono[] = [];
  cargando = false;
  modalVisible = false;

  ngOnInit(): void {
    if (this.idInstalacion()) {
      this.cargar();
    }
  }

  abrirModal(): void {
    this.telefono = null;
    this.modalVisible = true;
  }

  cargar(): void {
    this.cargando = true;
    this.cdr.detectChanges();

    this.service.getAll({ idInstalacion: this.idInstalacion() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response: ApiResponseWrapper<InstalacionTelefono[]>) => {
        this.telefonos = response.data ?? [];

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar teléfonos', err);
        mensajesUtil(this.messageService, 'error', 'cargas');
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
        const telefono = this.telefonos.find(p => p.id === id);
        if (telefono) {
          telefono.visible = !telefono.visible;
        }

        mensajesUtil(this.messageService, 'success', 'update');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado del telefono', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(telefono: InstalacionTelefono): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar el teléfono "<strong>${telefono.numero}</strong>"?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(telefono.id)
    });
  }

  private borrarRegistro(id: number): void {
    this.service.borrarRegistro(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        this.telefonos = this.telefonos.filter(t => t.id !== id);
        mensajesUtil(this.messageService, 'success', 'delete');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al borrar el teléfono', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Editar registro
   * @param id Id del registro
   */
  editar(id: string): void {
    this.service.get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response: ApiResponseWrapper<InstalacionTelefono>) => {
        this.telefono = response.data || [];

        if (this.telefono) {
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

  /**
   * Guarda/actualiza registro
   * @param instalacionTelefono Datos del teléfono
   */
  guardar(instalacionTelefono: InstalacionTelefono) {
    this.cargando = true;

    const datos: InstalacionTelefono = {
      id: instalacionTelefono.id,
      idInstalacion: instalacionTelefono.idInstalacion,
      numero: instalacionTelefono.numero,
      contacto: instalacionTelefono.contacto,
      visible: instalacionTelefono.visible
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
          console.error('Error al actualizar', err);
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
