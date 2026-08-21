import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from '../../../services/dialog.service';
import { Caracteristica } from '../../../models/caracteristica';
import { CaracteristicaService } from '../../../services/caracteristica.service';
import { AccionesTablaComponent } from '../../../utils/acciones-tabla/acciones-tabla.component';
import { mensajesUtil } from '../../../utils/mensajes.util';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';
import { NivelDotacion } from '../../../models/niveldotacion';
import { EditModalComponent } from '../../../components/modal/edit-modal/edit-modal.component';
import { Truncar } from '../../../pipe/trucar.pipe';
import { BotonAddComponent } from '../../../components/boton-add/boton-add.component';

/**
 * @version 1.0.0
 */

@Component({
  standalone: true,
  selector: 'app-caracteristica',
  imports: [
    TableModule,
    Button,
    InputText,
    ReactiveFormsModule,
    ConfirmDialogModule,
    AccionesTablaComponent,
    EditModalComponent,
    Truncar,
    BotonAddComponent
  ],
  templateUrl: './caracteristica.component.html'
})
export class CaracteristicaComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CaracteristicaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);

  caracteristica: Caracteristica | any = null;
  caracteristicas: Caracteristica [] = [];
  cargando: boolean = true;
  modalVisible = false;

  form: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
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

    this.service.getAll(filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        if (response && Array.isArray(response.data)) {
          this.caracteristicas = response.data;
        } else {
          this.caracteristicas = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando provincias:', err);
        mensajesUtil(this.messageService, 'error', 'cargas');
        this.cargando = false;
        this.caracteristicas = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        this.caracteristicas = response.data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar caracteristicas', err);
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
        const caracteristica = this.caracteristicas.find(p => p.id === id);
        if (caracteristica) {
          caracteristica.activo = !caracteristica.activo;
        }

        mensajesUtil(this.messageService, 'success', 'update');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado de la caracteristica', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(caracteristica: Caracteristica): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${caracteristica.nombre}</strong>"?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(caracteristica.id)
    });
  }

  private borrarRegistro(id: number) {
    this.cargando = true;

    this.service.borrarRegistro(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        this.caracteristicas = this.caracteristicas.filter(p => p.id !== id);
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
    this.caracteristica = null;
    this.modalVisible = true;
  }

  editar(id: string) {
    this.service.get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response: ApiResponseWrapper<NivelDotacion>) => {
        this.caracteristica = response.data || [];

        if (this.caracteristica) {
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

  guardar(caracteristica: Caracteristica) {
    this.cargando = true;

    const datos: Caracteristica = {
      id: caracteristica.id,
      nombre: caracteristica.nombre,
      descripcion: caracteristica.descripcion,
      activo: caracteristica.activo
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
