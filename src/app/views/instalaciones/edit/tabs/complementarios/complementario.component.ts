import { ChangeDetectorRef, Component, EventEmitter, inject, model, OnInit, Output } from '@angular/core';
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
import { ModalComplementarioComponent } from './modal-complementario/modal-complementario.component';

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
    TableModule,
    ModalComplementarioComponent
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

  idInstalacion = model.required<string>();

  espaciosComplementarios: InstalacionEspacioComplementario[] = [];
  cargando = false;
  guardando = false;

  form: FormGroup = this.fb.group({
    id: [''],
    idInstalacion: ['', Validators.required],
    nombre: ['', Validators.required],
    descripcion: [''],
    visible: ['', Validators.required],
    activo: ['', Validators.required]
  });

  ngOnInit() {
    console.log('Cargando: ', this.idInstalacion());

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

        console.log('Datos cargados:', this.espaciosComplementarios);

        this.form.patchValue({
          id: this.idInstalacion()
        });

        this.cargando = false;
        this.cargandoChange.emit(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar datos', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar datos de instalaciones'
        });
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

    console.log(filtros);

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
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los gestores'
        });
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
        this.messageService.add({ severity: 'success', summary: 'Añadido', detail: 'Espacio complementario añadido correctamente' });
        this.guardando = false;
        this.cargarDatos(this.idInstalacion());
      },
      error: (err) => {
        console.error('Error al guardar espacio complementario', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar el espacio complementario' });
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

        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Se ha actualizado el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado del telefono', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el estado' });
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

        this.messageService.add({
          severity: 'success',
          summary: 'Actualizado',
          detail: 'Se ha actualizado la visibilidad'
        });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar la visibilidad del telefono', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar la visibilidad' });
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
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Se ha borrado correctamente' });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al borrar', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al borrar' });
        this.cdr.detectChanges();
      }
    });
  }

  isVisible: boolean = false;

  addComplementario() {
    this.isVisible = true;
  }

}
