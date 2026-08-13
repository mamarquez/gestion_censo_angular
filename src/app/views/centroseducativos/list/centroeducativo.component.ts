import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from '../../../services/dialog.service';
import { TooltipModule } from 'primeng/tooltip';
import { CentroEducativo } from '../../../models/centroeducativo';
import { CentroEducativoService } from '../../../services/centroeducativo.service';
import { ActividadDeportiva } from '../../../models/actividaddeportiva';
import { AccionesTablaComponent } from '../../../utils/acciones-tabla/acciones-tabla.component';
import { EditModalComponent } from '../../../components/modal/edit-modal/edit-modal.component';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';
import { mensajesUtil } from '../../../utils/mensajes.util';

/**
 * @version 1.0.1
 */

@Component({
  standalone: true,
  selector: 'app-list-centro-educativo',
  imports: [
    TableModule,
    Button,
    InputText,
    ReactiveFormsModule,
    ConfirmDialogModule,
    TooltipModule,
    AccionesTablaComponent,
    EditModalComponent
  ],
  templateUrl: './centroeducativo.component.html'
})
export class ListCentroEducativoComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CentroEducativoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  centroEducativo: CentroEducativo | any = null;
  centrosEducativos: CentroEducativo [] = [];
  cargando: boolean = true;
  modalVisible = false;

  form: FormGroup = this.fb.group({
    id: [''],
    nombre: [''],
    descripcion: [''],
    activo: ['']
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

    this.service.getAll(filtros).subscribe({
      next: (response) => {
        if (response && Array.isArray(response.data)) {
          this.centrosEducativos = response.data;
        } else {
          this.centrosEducativos = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando centro educativo:', err);
        mensajesUtil(this.messageService, 'error', 'cargas');
        this.cargando = false;
        this.centrosEducativos = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.centrosEducativos = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar centros educativos', err);
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

    this.service.cambiarEstado(id).subscribe({
      next: () => {
        const centroEducativo = this.centrosEducativos.find(p => p.id === id);
        if (centroEducativo) {
          centroEducativo.activo = !centroEducativo.activo;
        }

        mensajesUtil(this.messageService, 'success', 'update');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado de la centro educativo', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(actividadDeportiva: ActividadDeportiva): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${actividadDeportiva.nombre}"</strong>?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(actividadDeportiva.id)
    });
  }

  private borrarRegistro(id: number) {
    this.cargando = true;

    this.service.borrarRegistro(id).subscribe({
      next: () => {
        this.centrosEducativos = this.centrosEducativos.filter(p => p.id !== id);
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
    this.centroEducativo = null;
    this.modalVisible = true;
  }

  editar(id: string) {
    this.service.get(id).subscribe({
      next: (response: ApiResponseWrapper<CentroEducativo>) => {
        this.centroEducativo = response.data || [];

        if (this.centroEducativo) {
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

  guardar(centroEducativo: CentroEducativo) {
    this.cargando = true;

    const datos: CentroEducativo = {
      id: centroEducativo.id,
      nombre: centroEducativo.nombre,
      descripcion: centroEducativo.descripcion,
      activo: centroEducativo.activo
    };

    if (datos.id) {
      this.service.updateRegistro(datos).subscribe({
        next: () => {
          mensajesUtil(this.messageService, 'success', 'update');
          this.modalVisible = false;
          this.cargando = false;
          this.cargar();
        },
        error: (err) => {
          console.error('Error al actualizar nivel energético', err);
          mensajesUtil(this.messageService, 'error', 'error');
          this.cargando = false;
        }
      });
    } else {
      this.service.addRegistro(datos).subscribe({
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
