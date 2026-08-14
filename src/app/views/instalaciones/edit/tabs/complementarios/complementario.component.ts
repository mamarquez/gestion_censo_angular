import { ChangeDetectorRef, Component, EventEmitter, inject, input, OnInit, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogService } from '../../../../../services/dialog.service';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import {
  InstalacionEspacioComplementarioService
} from '../../../../../services/instalacionEspacioComplementario.service';
import { InstalacionEspacioComplementario } from '../../../../../models/instalacionEspacioComplementario';
import { TableModule } from 'primeng/table';
import { InputText } from 'primeng/inputtext';
import { AccionesTablaComponent } from '../../../../../utils/acciones-tabla/acciones-tabla.component';
import { ApiResponseWrapper } from '../../../../../interface/api-response-wrapper.interface';
import { mensajesUtil } from '../../../../../utils/mensajes.util';

/**
 * @version 1.0.1
 */

@Component({
  standalone: true,
  selector: 'app-datos-complementarios',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CheckboxModule,
    ButtonModule,
    ToastModule,
    AccionesTablaComponent,
    InputText,
    TableModule
  ],
  templateUrl: './complementario.component.html'
})
export class ComplementarioComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InstalacionEspacioComplementarioService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  @Output() cargandoChange = new EventEmitter<boolean>();

  idInstalacion = input<string>('');

  espacioComplementario: InstalacionEspacioComplementario | any = null;
  espaciosComplementarios: InstalacionEspacioComplementario[] = [];
  cargando = false;
  guardando = false;
  modalVisible = false;

  form: FormGroup = this.fb.group({
    id: [null],
    idInstalacion: [null, Validators.required],
    nombre: [null, Validators.required],
    descripcion: [null],
    visible: [true],
    activo: [true]
  });

  ngOnInit() {
    if (this.idInstalacion()) {
      this.cargarDatos(this.idInstalacion());
    }
  }

  private cargarDatos(id: string): void {
    this.cargando = true;
    this.cargandoChange.emit(true);
    this.cdr.detectChanges();

    this.service.getAll({ idInstalacion: id }).subscribe({
      next: (response: ApiResponseWrapper<InstalacionEspacioComplementario[]>) => {
        this.espaciosComplementarios = response.data ?? [];

        this.form.patchValue({
          id: this.idInstalacion()
        });

        this.cargando = false;
        this.cargandoChange.emit(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar datos', err);
        mensajesUtil(this.messageService, 'error', 'cargas');
        this.cargando = false;
        this.cargandoChange.emit(false);
        this.cdr.detectChanges();
      }
    });
  }

  limpiar() {
    this.form.reset();
    this.form.patchValue({
      id: this.idInstalacion()
    });
    this.buscar();
  }

  buscar() {
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
        console.error('Error cargando provincias:', err);
        mensajesUtil(this.messageService, 'error', 'cargas');
        this.cargando = false;
        this.espaciosComplementarios = [];
      }
    });
  }

  addRegistro(idEspacioComplementario: number) {
    this.guardando = true;

    const datos: Partial<InstalacionEspacioComplementario> = {
      idInstalacion: Number(this.idInstalacion()),
      espacioComplementario: { id: idEspacioComplementario } as any,
      visible: true,
      activo: true
    };

    this.service.crear(datos).subscribe({
      next: () => {
        mensajesUtil(this.messageService, 'success', 'add');
        this.guardando = false;
        this.cargarDatos(this.idInstalacion());
      },
      error: (err) => {
        console.error('Error al guardar espacio complementario', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarEstado(id: number) {
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
        console.error('Error al cambiar el estado del telefono', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarVisible(id: number) {
    this.cargando = true;

    this.service.cambiarVisible(id).subscribe({
      next: () => {
        const espacioComplementario = this.espaciosComplementarios.find(p => p.id === id);
        if (espacioComplementario) {
          espacioComplementario.visible = !espacioComplementario.visible;
        }

        mensajesUtil(this.messageService, 'success', 'update');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar la visibilidad del telefono', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(espacioComplementario: InstalacionEspacioComplementario) {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${espacioComplementario.espacioComplementario.nombre}</strong>"?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(espacioComplementario.id!)
    });
  }

  private borrarRegistro(id: number): void {
    this.service.borrarRegistro(id).subscribe({
      next: () => {
        this.espaciosComplementarios = this.espaciosComplementarios.filter(t => t.id !== id);
        mensajesUtil(this.messageService, 'success', 'delete');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al borrar', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  abrirModal(): void {
    this.espacioComplementario = null;
    this.modalVisible = true;
  }

  /*
  editar(id: string) {
    this.service.get(id).subscribe({
      next: (response: ApiResponseWrapper<InstalacionEspacioComplementario>) => {
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
  */

}
