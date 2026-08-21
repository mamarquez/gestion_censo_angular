import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { AccionesTablaComponent } from '../../../utils/acciones-tabla/acciones-tabla.component';
import { MessageService } from 'primeng/api';
import { ComunidadAutonoma } from '../../../models/comunidadautonoma';
import { DialogService } from '../../../services/dialog.service';
import { ComunidadautonomaService } from '../../../services/comunidadautonoma.service';
import { mensajesUtil } from '../../../utils/mensajes.util';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';
import { CentroEducativo } from '../../../models/centroeducativo';
import { EditModalComponent } from '../../../components/modal/edit-modal/edit-modal.component';
import { BotonAddComponent } from '../../../components/boton-add/boton-add.component';

/**
 * @version 1.0.1
 */

@Component({
  standalone: true,
  selector: 'app-list-comunidades',
  imports: [
    TableModule,
    Button,
    InputText,
    ReactiveFormsModule,
    ConfirmDialogModule,
    TooltipModule,
    AccionesTablaComponent,
    EditModalComponent,
    BotonAddComponent
  ],
  templateUrl: 'comunidades.component.html'
})
export class ListComunidadesComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ComunidadautonomaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);

  comunidad: ComunidadAutonoma | any = null;
  comunidades: ComunidadAutonoma[] = [];
  cargando: boolean = true;
  modalVisible = false;

  form: FormGroup = this.fb.group({
    id: [null],
    codigo: ['', Validators.required],
    nombre: ['', Validators.required],
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
          this.comunidades = response.data;
        } else {
          this.comunidades = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando:', err);
        mensajesUtil(this.messageService, 'error', 'cargas');
        this.cargando = false;
        this.comunidades = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        this.comunidades = response.data || [];
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
        const comunidadAutonoma = this.comunidades.find(p => p.id === id);
        if (comunidadAutonoma) {
          comunidadAutonoma.activo = !comunidadAutonoma.activo;
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

  confirmarBorrado(comunidadAutonoma: ComunidadAutonoma): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${comunidadAutonoma.nombre}"</strong>?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(comunidadAutonoma.id)
    });
  }

  private borrarRegistro(id: number) {
    this.cargando = true;

    this.service.borrarRegistro(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        this.comunidades = this.comunidades.filter(p => p.id !== id);
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
    this.comunidad = null;
    this.modalVisible = true;
  }

  editar(id: string) {
    this.service.get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response: ApiResponseWrapper<CentroEducativo>) => {
        this.comunidad = response.data || [];

        if (this.comunidad) {
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

  guardar(comunidadAutonoma: ComunidadAutonoma) {
    this.cargando = true;

    const datos: ComunidadAutonoma = {
      id: comunidadAutonoma.id,
      codigo: comunidadAutonoma.codigo,
      nombre: comunidadAutonoma.nombre,
      activo: comunidadAutonoma.activo
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
          console.error('Error al actualizar', {
            codigo: err.status,
            error: err
          });
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
