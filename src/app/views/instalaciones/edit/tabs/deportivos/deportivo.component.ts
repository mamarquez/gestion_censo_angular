import { ChangeDetectorRef, Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogService } from '../../../../../services/dialog.service';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiResponse } from '../../../../../models/apiresponse';
import { InstalacionEspacioDeportivoService } from '../../../../../services/instalacionEspacioDeportivo.service';
import { InstalacionEspacioDeportivo } from '../../../../../models/instalacionEspacioDeportivo';
import { AccionesTablaComponent } from '../../../../../utils/acciones-tabla/acciones-tabla.component';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { EspacioDeportivo } from '../../../../../models/espaciodeportivo';
import { mensajesUtil } from '../../../../../utils/mensajes.util';
import { ApiResponseWrapper } from '../../../../../interface/api-response-wrapper.interface';

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

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InstalacionEspacioDeportivoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  @Output() cargandoChange = new EventEmitter<boolean>();

  private id: string | null = null;
  espaciosDeportivos: InstalacionEspacioDeportivo[] = [];
  cargando = false;
  guardando = false;

  form: FormGroup = this.fb.group({
    id: [null],
    idInstalacion: ['', Validators.required],
    nombre: ['', Validators.required],
    descripcion: [null],
    visible: [true],
    activo: [true]
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
        mensajesUtil(this.messageService, 'error', 'cargas');
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
      next: (response: ApiResponseWrapper<InstalacionEspacioDeportivo>) => {
        const espacioDeportivo = this.espaciosDeportivos.find(p => p.id === id);
        if (espacioDeportivo) {
          espacioDeportivo.activo = !espacioDeportivo.activo;
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

    this.service.cambiarEstado(id).subscribe({
      next: (response: ApiResponseWrapper<InstalacionEspacioDeportivo>) => {
        const espacioDeportivo = this.espaciosDeportivos.find(c => c.id === id);
        if (espacioDeportivo) {
          espacioDeportivo.visible = !espacioDeportivo.visible;
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
      next: (response: ApiResponseWrapper<InstalacionEspacioDeportivo>) => {
        this.espaciosDeportivos = this.espaciosDeportivos.filter(t => t.id !== id);
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

  editar(id: number) {
    this.router.navigate(['/espaciosdeportivos', id]);
  }

}
