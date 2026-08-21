import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from '../../../services/dialog.service';
import { Municipio } from '../../../models/municipio';
import { MunicipioService } from '../../../services/municipio.service';
import { AccionesTablaComponent } from '../../../utils/acciones-tabla/acciones-tabla.component';
import { mensajesUtil } from '../../../utils/mensajes.util';
import { EditModalComponent } from '../../../components/modal/edit-modal/edit-modal.component';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';
import { CentroEducativo } from '../../../models/centroeducativo';
import { BotonAddComponent } from "../../../components/boton-add/boton-add.component";

/**
 * @version 1.0.1
 */

@Component({
  selector: 'app-municipio',
  standalone: true,
  imports: [
    TableModule,
    Button,
    InputText,
    ReactiveFormsModule,
    ConfirmDialogModule,
    AccionesTablaComponent,
    EditModalComponent,
    BotonAddComponent
],
  templateUrl: './municipio.component.html'
})
export class MunicipioComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(MunicipioService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);

  municipio: Municipio | any = null;
  municipios: Municipio[] = [];
  cargando: boolean = true;
  modalVisible = false;

  form: FormGroup = this.fb.group({
    id: [null],
    cpro: ['', [Validators.required, Validators.maxLength(2)]],
    cmun: ['', [Validators.required, Validators.maxLength(3)]],
    dc: ['', [Validators.required, Validators.maxLength(1)]],
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
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
          this.municipios = response.data;
        } else {
          this.municipios = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error', { codigo: err.status, error: err });
        mensajesUtil(this.messageService, 'error', 'cargas');
        this.cargando = false;
        this.municipios = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        this.municipios = response.data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error', { codigo: err.status, error: err });
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
        const provincia = this.municipios.find(p => p.id === id);
        if (provincia) {
          provincia.activo = !provincia.activo;
        }

        mensajesUtil(this.messageService, 'success', 'update');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error', { codigo: err.status, error: err });
        mensajesUtil(this.messageService, 'error', 'error');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(municipio: Municipio): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${municipio.nombre}</strong>"?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(municipio.id)
    });
  }

  private borrarRegistro(id: number) {
    this.cargando = true;

    this.service.borrarRegistro(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        this.municipios = this.municipios.filter(p => p.id !== id);
        mensajesUtil(this.messageService, 'success', 'delete');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error', { codigo: err.status, error: err });
        mensajesUtil(this.messageService, 'error', 'error');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });

    this.cargando = false;
  }

  abrirModal(): void {
    this.municipio = null;
    this.modalVisible = true;
  }

  editar(id: string) {
    this.service.get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response: ApiResponseWrapper<CentroEducativo>) => {
        this.municipio = response.data || [];

        if (this.municipio) {
          this.modalVisible = true;
        }
      },
      error: (err) => {
        console.error('Error', { codigo: err.status, error: err });
        mensajesUtil(this.messageService, 'error', 'carga');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardar(municipio: Municipio) {
    this.cargando = true;

    const datos: Municipio = {
      id: municipio.id,
      cpro: municipio.cpro,
      cmun: municipio.cmun,
      dc: municipio.dc,
      nombre: municipio.nombre,
      activo: municipio.activo
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
          console.error('Error', { codigo: err.status, error: err });
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
          console.error('Error', { codigo: err.status, error: err });
          mensajesUtil(this.messageService, 'error', 'error');
          this.cargando = false;
        }
      });
    }
  }

}
