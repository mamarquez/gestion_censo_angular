import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableModule } from 'primeng/table';
import { NivelDotacion } from '../../../models/niveldotacion';
import { NivelDotacionService } from '../../../services/nivelDotacion.service';
import { Button } from 'primeng/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogService } from '../../../services/dialog.service';
import { InputText } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { NivelEducativo } from '../../../models/niveleducativo';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';
import { mensajesUtil } from '../../../utils/mensajes.util';
import { EditModalComponent } from '../../../components/modal/edit-modal/edit-modal.component';
import { Truncar } from '../../../pipe/trucar.pipe';
import { AccionesTablaComponent } from '../../../utils/acciones-tabla/acciones-tabla.component';

/**
 * @version 1.0.0
 */

@Component({
  standalone: true,
  selector: 'app-nivel-dotacion',
  imports: [
    TableModule,
    Button,
    InputText,
    ReactiveFormsModule,
    ConfirmDialogModule,
    EditModalComponent,
    Truncar,
    AccionesTablaComponent
  ],
  templateUrl: './niveldotacion.component.html'
})
export class NivelDotacionComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(NivelDotacionService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);

  nivelDotacion: NivelEducativo | any = null;
  nivelesDotaciones: NivelDotacion [] = [];
  cargando: boolean = true;
  modalVisible = false;

  form: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', [Validators.required, Validators.maxLength(NivelDotacion.campos.nombre.maxLength)]],
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
          this.nivelesDotaciones = response.data;
        } else {
          this.nivelesDotaciones = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando niveles dotaciones', err);
        mensajesUtil(this.messageService, 'error', 'cargas');
        this.cargando = false;
        this.nivelesDotaciones = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        this.nivelesDotaciones = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar niveles educativos', err);
        mensajesUtil(this.messageService, 'error', 'carga');
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
        const nivelDotacion = this.nivelesDotaciones.find(p => p.id === id);
        if (nivelDotacion) {
          nivelDotacion.activo = !nivelDotacion.activo;
        }

        mensajesUtil(this.messageService, 'success', 'update');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado de nivel energético', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(nivel: NivelDotacion): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${nivel.nombre}"</strong>?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(nivel.id)
    });
  }

  private borrarRegistro(id: number) {
    this.cargando = true;

    this.service.borrarRegistro(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        this.nivelesDotaciones = this.nivelesDotaciones.filter(p => p.id !== id);
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
    this.nivelDotacion = null;
    this.modalVisible = true;
  }

  editar(id: string) {
    this.service.get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response: ApiResponseWrapper<NivelDotacion>) => {
        this.nivelDotacion = response.data || [];

        if (this.nivelDotacion) {
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

  guardar(nivelDotacion: NivelDotacion) {
    this.cargando = true;

    const datos: NivelEducativo = {
      id: nivelDotacion.id,
      nombre: nivelDotacion.nombre,
      descripcion: nivelDotacion.descripcion,
      activo: nivelDotacion.activo
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
          console.error('Error al actualizar nivel de dotación', err);
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
