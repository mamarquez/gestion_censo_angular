import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
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
import { CentroEducativo } from '../../../models/centroeducativo';
import { ComunidadAutonoma } from '../../../models/comunidadautonoma';
import { EditModalComponent } from '../../../components/modal/edit-modal/edit-modal.component';

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
    DropdownModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    AccionesTablaComponent,
    EditModalComponent
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
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  provincia: Provincia | any = null;
  provincias: Provincia[] = [];
  cargando: boolean = true;
  modalVisible = false;

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
    this.cargando = true;

    this.service.getAll(filtros).subscribe({
      next: (response) => {
        if (response && Array.isArray(response.data)) {
          this.provincias = response.data;
        } else {
          this.provincias = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando provincias:', err);
        mensajesUtil(this.messageService, 'error', 'cargas');
        this.cargando = false;
        this.provincias = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.provincias = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar provincias', err);
        mensajesUtil(this.messageService, 'error', 'cargas');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarEstado(id: number): void {
    this.cargando = true;

    this.service.cambiarEstado(id).subscribe({
      next: () => {
        const provincia = this.provincias.find(p => p.id === id);
        if (provincia) {
          provincia.activo = !provincia.activo;
        }

        mensajesUtil(this.messageService, 'success', 'update');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado de la provincia', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cargando = false;
        this.cdr.detectChanges();
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
    this.cargando = true;

    this.service.borrarRegistro(id).subscribe({
      next: () => {
        this.provincias = this.provincias.filter(p => p.id !== id);
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
    this.provincia = null;
    this.modalVisible = true;
  }

  editar(id: string) {
    this.service.get(id).subscribe({
      next: (response: ApiResponseWrapper<Provincia>) => {
        this.provincia = response.data || [];

        if (this.provincia) {
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

  guardar(provincia: Provincia) {
    this.cargando = true;

    const datos: Provincia = {
      id: provincia.id,
      ine: provincia.ine,
      nombre: provincia.nombre,
      activo: provincia.activo
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
          console.error('Error al actualizar', {
            codigo: err.status,
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
          console.error('Error al añadir registro', err);
          mensajesUtil(this.messageService, 'error', 'error');
          this.cargando = false;
        }
      });
    }
  }

}
