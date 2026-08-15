import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableModule } from 'primeng/table';
import { EspacioDeportivo } from '../../../models/espaciodeportivo';
import { EspacioDeportivoService } from '../../../services/espaciodeportivo.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { DialogService } from '../../../services/dialog.service';
import { AccionesTablaComponent } from '../../../utils/acciones-tabla/acciones-tabla.component';
import { mensajesUtil } from '../../../utils/mensajes.util';
import { EditModalComponent } from '../../../components/modal/edit-modal/edit-modal.component';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';
import { NivelDotacion } from '../../../models/niveldotacion';
import { Caracteristica } from '../../../models/caracteristica';
import { Truncar } from '../../../pipe/trucar.pipe';

/**
 * @version 1.0.1
 */

@Component({
  standalone: true,
  selector: 'app-espacio-deportivo',
  imports: [
    TableModule,
    Button,
    InputText,
    ReactiveFormsModule,
    ConfirmDialogModule,
    TooltipModule,
    AccionesTablaComponent,
    EditModalComponent,
    Truncar
  ],
  templateUrl: './espaciodeportivo.component.html'
})
export class EspacioDeportivoComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(EspacioDeportivoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);

  espacioDeportivo: EspacioDeportivo | any = null;
  espaciosDeportivos: EspacioDeportivo [] = [];
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

    this.service.getAll(filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        if (response && Array.isArray(response.data)) {
          this.espaciosDeportivos = response.data;
        } else {
          this.espaciosDeportivos = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando:', err);
        mensajesUtil(this.messageService, 'error', 'cargas');
        this.cargando = false;
        this.espaciosDeportivos = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        this.espaciosDeportivos = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar', err);
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
        const espacioDeportivo = this.espaciosDeportivos.find(p => p.id === id);
        if (espacioDeportivo) {
          espacioDeportivo.activo = !espacioDeportivo.activo;
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

  confirmarBorrado(registro: EspacioDeportivo): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${registro.nombre}"</strong>?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(registro.id)
    });
  }

  private borrarRegistro(id: number) {
    this.cargando = true;

    this.service.borrarRegistro(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        this.espaciosDeportivos = this.espaciosDeportivos.filter(p => p.id !== id);
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
    this.espacioDeportivo = null;
    this.modalVisible = true;
  }

  editar(id: string) {
    this.service.get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response: ApiResponseWrapper<EspacioDeportivo>) => {
        this.espacioDeportivo = response.data || [];

        if (this.espacioDeportivo) {
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

  guardar(espacioDeportivo: EspacioDeportivo) {
    this.cargando = true;

    const datos: EspacioDeportivo = {
      id: espacioDeportivo.id,
      nombre: espacioDeportivo.nombre,
      descripcion: espacioDeportivo.descripcion,
      valor: espacioDeportivo.valor,
      activo: espacioDeportivo.activo
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
          console.error('Error al actualizar nivel energético', err);
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
