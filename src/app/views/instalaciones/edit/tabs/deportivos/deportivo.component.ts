import { ChangeDetectorRef, Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogService } from '../../../../../services/dialog.service';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from '../../../../../models/apiresponse';
import { SelectModule } from 'primeng/select';
import { Provincia } from '../../../../../models/provincia';
import { Municipio } from '../../../../../models/municipio';
import { SelectComunidadComponent } from '../../../../../components/select-comunidad/select-comunidad.component';
import { SelectProvinciaComponent } from '../../../../../components/select-provincia/select-provincia.component';
import { SelectMunicipioComponent } from '../../../../../components/select-municipio/select-provincia.component';
import { InstalacionespaciodeportivoService } from '../../../../../services/instalacionespaciodeportivo.service';
import { InstalacionEspacioDeportivo } from '../../../../../models/instalacionEspacioDeportivo';
import { AccionesTablaComponent } from '../../../../../utils/acciones-tabla/acciones-tabla.component';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { EspacioDeportivo } from '../../../../../models/espaciodeportivo';

@Component({
  standalone: true,
  selector: 'app-datos-espacios-deportivos',
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
  providers: [MessageService],
  templateUrl: './deportivo.component.html'
})
export class DatosEspaciosDeportivosComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InstalacionespaciodeportivoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  @Output() cargandoChange = new EventEmitter<boolean>();

  private id: string | null = null;
  espaciosDeportivos: InstalacionEspacioDeportivo[] = [];
  cargando = false;
  guardando = false;

  form: FormGroup = this.fb.group({
    id: [''],
    idInstalacion: ['', Validators.required],
    nombre: ['', Validators.required],
    descripcion: [''],
    visible: ['', Validators.required],
    activo: ['', Validators.required],
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

    this.service.getAll({ idInstalacion: id }).subscribe({
      next: (response: ApiResponse<InstalacionEspacioDeportivo[]>) => {
        this.espaciosDeportivos = response.data ?? [];

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

  limpiar(){

  }

  buscar() {

  }

  cambiarEstado(id: number) {
    this.cargando = true;

    this.service.cambiarEstado(id).subscribe({
      next: () => {
        const espacioDeportivo = this.espaciosDeportivos.find(p => p.id === id);
        if (espacioDeportivo) {
          espacioDeportivo.activo = !espacioDeportivo.activo;
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

  confirmarBorrado(espacioDeportivo: EspacioDeportivo) {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar el teléfono "<strong>${espacioDeportivo.nombre}</strong>"?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(espacioDeportivo.id)
    });
  }

  private borrarRegistro(id: number): void {
    this.service.borrarRegistro(id).subscribe({
      next: () => {
        this.espaciosDeportivos = this.espaciosDeportivos.filter(t => t.id !== id);
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

}
