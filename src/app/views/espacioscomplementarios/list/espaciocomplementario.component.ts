import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogService } from '../../../services/dialog.service';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { EspacioComplementario } from '../../../models/espaciocomplementario';
import { EspacioComplementarioService } from '../../../services/espaciocomplementario.service';
import { AccionesTablaComponent } from '../../../utils/acciones-tabla/acciones-tabla.component';
import { mensajesUtil } from '../../../utils/mensajes.util';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';

/**
 * @version 1.0.1
 */

@Component({
  standalone: true,
  selector: 'app-espacio-complementario',
  imports: [TableModule, Button, InputText, ReactiveFormsModule, ConfirmDialogModule, TooltipModule, AccionesTablaComponent],
  templateUrl: './espaciocomplementario.component.html'
})
export class EspacioComplementarioCompoment implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(EspacioComplementarioService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  espacioComplementario: EspacioComplementario | any = null;
  espaciosComplementarios: EspacioComplementario [] = [];
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
          this.espaciosComplementarios = response.data;
        } else {
          this.espaciosComplementarios = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando espacios complementarios:', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cargando = false;
        this.espaciosComplementarios = [];
      }
    });
  }

  cargar(): void {
    console.log('Cargade...');

    this.service.getAll().subscribe({
      next: (response) => {
        this.espaciosComplementarios = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar espacios complementarios', err);
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
        const espacioComplementario = this.espaciosComplementarios.find(p => p.id === id);
        if (espacioComplementario) {
          espacioComplementario.activo = !espacioComplementario.activo;
        }

        mensajesUtil(this.messageService, 'success', 'update');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(espacioComplementario: EspacioComplementario): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${espacioComplementario.nombre}"</strong>?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(espacioComplementario.id)
    });
  }

  private borrarRegistro(id: number) {
    this.cargando = true;

    this.service.borrarRegistro(id).subscribe({
      next: () => {
        this.espaciosComplementarios = this.espaciosComplementarios.filter(p => p.id !== id);
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
    this.espacioComplementario = null;
    this.modalVisible = true;
  }

  editar(id: string) {
    this.service.get(id).subscribe({
      next: (response: ApiResponseWrapper<EspacioComplementario>) => {
        this.espacioComplementario = response.data ?? null;

        if (this.espacioComplementario !== null) {
          this.modalVisible = true;
        }
      },
      error: (err) => {
        console.error('Error al editar: ', {
          id,
          error: err
        });
        mensajesUtil(this.messageService, 'error', 'carga');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardar(espacioComplementario: EspacioComplementario) {
    this.cargando = true;

    const datos: EspacioComplementario = {
      id: espacioComplementario.id,
      nombre: espacioComplementario.nombre,
      descripcion: espacioComplementario.descripcion,
      activo: espacioComplementario.activo
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
