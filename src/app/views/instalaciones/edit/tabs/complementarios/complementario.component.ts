import { ChangeDetectorRef, Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogService } from '../../../../../services/dialog.service';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ActivatedRoute } from '@angular/router';
import { InstalacionEspacioComplementarioService } from '../../../../../services/instalacionEspacioComplementario.service';
import { InstalacionEspacioComplementario } from '../../../../../models/instalacionEspacioComplementario';
import { TableModule } from 'primeng/table';
import { InputText } from 'primeng/inputtext';
import { AccionesTablaComponent } from '../../../../../utils/acciones-tabla/acciones-tabla.component';
import { ApiResponseWrapper } from '../../../../../interface/api-response-wrapper.interface';

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
    /*
    SelectModule,
    SelectComunidadComponent,
    SelectProvinciaComponent,
    SelectMunicipioComponent

     */
  ],
  templateUrl: './complementario.component.html'
})
export class ComplementarioComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InstalacionEspacioComplementarioService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  @Output() cargandoChange = new EventEmitter<boolean>();

  private id: string | null = null;
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
    this.id = this.route.snapshot.paramMap.get('id');

    if (this.id) {
      this.cargarDatos(this.id);
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
          id: this.id
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

  }

  buscar() {

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

        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Se ha actualizado la visibilidad' });
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
      mensaje: `¿Deseas eliminar el teléfono "<strong>${espacioComplementario.activo}</strong>"?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(espacioComplementario.id!)
    });
  }

  private borrarRegistro(id: number): void {
    /*
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
    */
  }

}
