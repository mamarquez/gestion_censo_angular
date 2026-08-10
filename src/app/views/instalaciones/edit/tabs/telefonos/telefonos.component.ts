import { ChangeDetectorRef, Component, EventEmitter, inject, model, OnInit, Output } from '@angular/core';
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
import { ModalTelefonoComponent } from '../../../../../components/telefonos/modal-telefono/modal-telefono.component';

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
    ModalTelefonoComponent
  ],
  providers: [MessageService],
  templateUrl: './telefonos.component.html',
  styleUrl: './telefonos.component.css'
})
export class DatosTelefonosComponent implements OnInit {

  private readonly service = inject(InstalacionTelefonoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  idInstalacion = model.required<string>();
  @Output() cargandoChange = new EventEmitter<boolean>();

  modalVisible = false;

  telefonos: InstalacionTelefono[] = [];
  cargando = false;

  ngOnInit(): void {
    if (this.idInstalacion()) {
      this.cargar();
    }
  }

  abrirModal(): void {
    this.modalVisible = true;
  }

  cargar(): void {
    this.cargando = true;
    this.cargandoChange.emit(true);
    this.cdr.detectChanges();

    this.service.getAll({ idInstalacion: this.idInstalacion() }).subscribe({
      next: (response) => {
        this.telefonos = response.data ?? [];

        this.cargando = false;
        this.cargandoChange.emit(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar teléfonos', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar los teléfonos' });
        this.cargando = false;
        this.cargandoChange.emit(false);
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

    this.service.cambiarEstado(id).subscribe({
      next: () => {
        const telefono = this.telefonos.find(p => p.id === id);
        if (telefono) {
          telefono.visible = !telefono.visible;
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

  confirmarBorrado(telefono: InstalacionTelefono): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar el teléfono "<strong>${telefono.numero}</strong>"?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(telefono.id)
    });
  }

  private borrarRegistro(id: number): void {
    this.service.borrarRegistro(id).subscribe({
      next: () => {
        this.telefonos = this.telefonos.filter(t => t.id !== id);
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: 'Se ha borrado el teléfono correctamente'
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al borrar el teléfono', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al borrar el teléfono' });
        this.cdr.detectChanges();
      }
    });
  }
}
