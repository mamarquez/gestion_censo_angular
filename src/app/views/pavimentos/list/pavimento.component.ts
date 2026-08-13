import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from '../../../services/dialog.service';
import { TooltipModule } from 'primeng/tooltip';
import { Pavimento } from '../../../models/pavimento';
import { PavimentoService } from '../../../services/pavimento.service';
import { AccionesTablaComponent } from '../../../utils/acciones-tabla/acciones-tabla.component';
import { mensajesUtil } from '../../../utils/mensajes.util';
import { EditModalComponent } from '../../../components/modal/edit-modal/edit-modal.component';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';
import { Configuracion } from '../../../models/configuracion';
import { EspacioComplementario } from '../../../models/espaciocomplementario';

/**
 * @version 1.0.1
 */

@Component({
  standalone: true,
  selector: 'app-pavimento',
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
  templateUrl: './pavimento.component.html'
})
export class PavimentoComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PavimentoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  pavimento: Pavimento | any = null;
  pavimentos: Pavimento [] = [];
  cargando: boolean = true;
  modalVisible = false;

  form: FormGroup = this.fb.group({
    id: [null],
    nombre: [null, Validators.required],
    descripcion: [null],
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

    this.service.getAll(filtros).subscribe({
      next: (response) => {
        if (response && Array.isArray(response.data)) {
          this.pavimentos = response.data;
        } else {
          this.pavimentos = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando pavimentos:', err);
        mensajesUtil(this.messageService, 'error', 'cargas');
        this.cargando = false;
        this.pavimentos = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.pavimentos = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar pavimentos', err);
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
        const pavimento = this.pavimentos.find(p => p.id === id);
        if (pavimento) {
          pavimento.activo = !pavimento.activo;
        }

        mensajesUtil(this.messageService, 'sucess', 'update');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado del pavimento', err);
        mensajesUtil(this.messageService, 'error', 'update');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(pavimento: Pavimento): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${pavimento.nombre}"</strong>?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(pavimento.id)
    });
  }

  private borrarRegistro(id: number) {
    this.cargando = true;

    this.service.borrarRegistro(id).subscribe({
      next: () => {
        this.pavimentos = this.pavimentos.filter(p => p.id !== id);
        mensajesUtil(this.messageService, 'success', 'delete');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al borrar el registro', err);
        mensajesUtil(this.messageService, 'error', 'delete');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });

    this.cargando = false;
  }

  abrirModal(): void {
    this.pavimento = null;
    this.modalVisible = true;
  }

  editar(id: string) {
    this.service.get(id).subscribe({
      next: (response: ApiResponseWrapper<Pavimento>) => {
        this.pavimento = response.data || [];

        if (this.pavimento) {
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

  guardar(pavimento: Pavimento) {
    this.cargando = true;

    const datos: Pavimento = {
      id: pavimento.id,
      nombre: pavimento.nombre,
      descripcion: pavimento.descripcion,
      activo: pavimento.activo
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
          console.error('Error al actualizar: ', {
            datos,
            error: err
          });
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
          console.error(err.status);
          console.error(`Error HTTP ${err.status} al añadir registro`, {
            datos,
            statusText: err.statusText,
            url: err.url,
            error: err.error
          });
          mensajesUtil(this.messageService, 'error', 'error');
          this.cargando = false;
        }
      });
    }
  }

}
