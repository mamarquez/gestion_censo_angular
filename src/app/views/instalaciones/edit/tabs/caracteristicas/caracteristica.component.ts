import { ChangeDetectorRef, Component, EventEmitter, inject, model, OnInit, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogService } from '../../../../../services/dialog.service';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from '../../../../../models/apiresponse';
import { InputText } from 'primeng/inputtext';
import { AccionesTablaComponent } from '../../../../../utils/acciones-tabla/acciones-tabla.component';
import { TableModule } from 'primeng/table';
import { InstalacionCaracteristicaService } from '../../../../../services/instalacionCaracteristica.service';
import { InstalacionCaracteristica } from '../../../../../models/instalacionCaracteristica';
import { ModalCaracteristicaComponent } from '../../../../../components/caracteristica/modal-caracteristica/modal-caracteristica.component';

@Component({
  standalone: true,
  selector: 'app-datos-caracteristicas',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CheckboxModule,
    ButtonModule,
    ToastModule,
    InputText,
    AccionesTablaComponent,
    TableModule,
    ModalCaracteristicaComponent
  ],
  providers: [MessageService],
  templateUrl: './caracteristica.component.html'
})
export class DatosCaracteristicaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InstalacionCaracteristicaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  @Output() cargandoChange = new EventEmitter<boolean>();

  idInstalacion = model.required<string>();
  cargando: boolean = false;

  caracteristicas: InstalacionCaracteristica[] | [];

  modalVisible = false;

  form: FormGroup = this.fb.group({
    id: [''],
    nombre: ['']
  });

  ngOnInit() {
    if (this.idInstalacion()) {
      this.cargarDatos();
    }
  }

  cargarDatos(): void {
    this.cargando = true;
    this.cargandoChange.emit(true);
    this.cdr.detectChanges();

    this.service.getAll({ idInstalacion: this.idInstalacion() }).subscribe({
      next: (response: ApiResponse<InstalacionCaracteristica[]>) => {
        this.caracteristicas = response.data ?? [];

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

  limpiar() {

  }

  buscar() {

  }

  abrirModal(): void {
    this.modalVisible = true;
  }

  cambiarEstado(id: number) {
    this.cargando = true;

    this.service.cambiarEstado(id).subscribe({
      next: () => {
        const caracteristica = this.caracteristicas.find(p => p.id === id);
        if (caracteristica) {
          caracteristica.visible = !caracteristica.visible;
        }

        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Se ha actualizado el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarVisible(id: number) {
    this.cargando = true;

    this.service.cambiarVisible(id).subscribe({
      next: () => {
        const caracteristica = this.caracteristicas.find(p => p.id === id);
        if (caracteristica) {
          caracteristica.visible = !caracteristica.visible;
        }

        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Se ha actualizado el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(caracteristica: InstalacionCaracteristica) {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${caracteristica.caracteristica?.nombre}</strong>"?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(caracteristica.id)
    });
  }

  private borrarRegistro(id: number): void {
    this.service.borrarRegistro(id).subscribe({
      next: () => {
        this.caracteristicas = this.caracteristicas.filter(t => t.id !== id);
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Se ha borrado correctamente' });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al borrar', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al borrar' });
        this.cdr.detectChanges();
      }
    });
  }
}
