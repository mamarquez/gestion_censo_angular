import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Provincia } from '../../../models/provincia';
import { ProvinciaService } from '../../../services/provincia.service';
import { DialogService } from '../../../services/dialog.service';
import { AccionesTablaComponent } from '../../../utils/acciones-tabla/acciones-tabla.component';
import { mensajesUtil } from '../../../utils/mensajes.util';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';
import { EditModalComponent } from '../../../components/modal/edit-modal/edit-modal.component';
import { BotonAddComponent } from "../../../components/boton-add/boton-add.component";
import { FilasAutoajustablesDirective, opcionesFilasPorPagina } from '../../../utils/filas-autoajustables.directive';

/**
 * @version 1.0.1
 */

@Component({
  selector: 'app-list-provincia',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    RadioButtonModule,
    CheckboxModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    AccionesTablaComponent,
    EditModalComponent,
    BotonAddComponent,
    FilasAutoajustablesDirective
],
  providers: [
    MessageService,
    ConfirmationService
  ],
  templateUrl: './provincia.component.html'
})
export class ListProvinciaComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProvinciaService);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);

  provincia = signal<Provincia | null>(null);
  provincias = signal<Provincia[]>([]);
  cargando = signal<boolean>(true);
  modalVisible = signal<boolean>(false);
  filasPorPagina = signal(10);

  get opcionesFilasPorPagina(): number[] {
    return opcionesFilasPorPagina(this.filasPorPagina());
  }

  form: FormGroup = this.fb.group({
    id: [null],
    ine: ['', [Validators.required, Validators.maxLength(2)]],
    nombre: ['', [Validators.required, Validators.maxLength(75)]],
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
    this.cargando.set(true);

    this.service.getAll(filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.provincias.set(response && Array.isArray(response.data) ? response.data : []);
          this.cargando.set(false);
        },
        error: (err) => {
          console.error('Error cargando provincias:', err);
          mensajesUtil(this.messageService, 'error', 'cargas');
          this.cargando.set(false);
          this.provincias.set([]);
        }
      });
  }

  cargar(): void {
    this.service.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.provincias.set(response.data || []);
          this.cargando.set(false);
        },
        error: (err) => {
          console.error('Error al cargar provincias', err);
          mensajesUtil(this.messageService, 'error', 'cargas');
          this.cargando.set(false);
        }
      });
  }

  cambiarEstado(id: number): void {
    this.cargando.set(true);

    this.service.cambiarEstado(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.provincias.update(provincias =>
            provincias.map(p => p.id === id ? { ...p, activo: !p.activo } : p)
          );

          mensajesUtil(this.messageService, 'success', 'update');
          this.cargando.set(false);
        },
        error: (err) => {
          console.error('Error al cambiar el estado de la provincia', err);
          mensajesUtil(this.messageService, 'error', 'error');
          this.cargando.set(false);
        }
      });
  }

  confirmarBorrado(provincia: Provincia): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${provincia.nombre}</strong>"?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(provincia.id)
    });
  }

  private borrarRegistro(id: number) {
    this.cargando.set(true);

    this.service.borrarRegistro(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.provincias.update(provincias => provincias.filter(p => p.id !== id));
          mensajesUtil(this.messageService, 'success', 'delete');
          this.cargando.set(false);
        },
        error: (err) => {
          console.error('Error al borrar el registro', err);
          mensajesUtil(this.messageService, 'error', 'error');
          this.cargando.set(false);
        }
      });
  }

  abrirModal(): void {
    this.provincia.set(null);
    this.modalVisible.set(true);
  }

  editar(id: string) {
    this.service.get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: ApiResponseWrapper<Provincia>) => {
          this.provincia.set(response.data || null);

          if (this.provincia()) {
            this.modalVisible.set(true);
          }
        },
        error: (err) => {
          console.error('Error al editar: ', err);
          mensajesUtil(this.messageService, 'error', 'carga');
          this.cargando.set(false);
        }
      });
  }

  guardar(provincia: Provincia) {
    this.cargando.set(true);

    const datos: Provincia = {
      id: provincia.id,
      ine: provincia.ine,
      nombre: provincia.nombre,
      activo: provincia.activo
    };

    if (datos.id) {
      this.service.updateRegistro(datos)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            mensajesUtil(this.messageService, 'success', 'update');
            this.modalVisible.set(false);
            this.cargando.set(false);
            this.cargar();
          },
          error: (err) => {
            console.error('Error al actualizar', {
              codigo: err.status,
              error: err
            });
            mensajesUtil(this.messageService, 'error', 'error');
            this.cargando.set(false);
          }
        });
    } else {
      this.service.addRegistro(datos)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            mensajesUtil(this.messageService, 'success', 'add');
            this.modalVisible.set(false);
            this.cargando.set(false);
            this.cargar();
          },
          error: (err) => {
            console.error('Error al añadir registro', err);
            mensajesUtil(this.messageService, 'error', 'error');
            this.cargando.set(false);
          }
        });
    }
  }

}
