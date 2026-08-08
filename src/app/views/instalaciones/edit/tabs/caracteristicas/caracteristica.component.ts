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
import { InputText } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { AccionesTablaComponent } from '../../../../../utils/acciones-tabla/acciones-tabla.component';
import { TableModule } from 'primeng/table';
import { InstalacionCaracteristicaService } from '../../../../../services/instalacionCaracteristica.service';
import { InstalacionCaracteristica } from '../../../../../models/instalacionCaracteristica';
import { CaracteristicaService } from '../../../../../services/caracteristica.service';
import { MedidaService } from '../../../../../services/medida.service';
import { Caracteristica } from '../../../../../models/caracteristica';
import { Medida } from '../../../../../models/medida';

@Component({
  standalone: true,
  selector: 'app-datos-caracteristicas',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CheckboxModule,
    ButtonModule,
    ToastModule,
    SelectModule,
    InputText,
    InputNumberModule,
    DialogModule,
    AccionesTablaComponent,
    TableModule
  ],
  providers: [MessageService],
  templateUrl: './caracteristica.component.html'
})
export class DatosCaracteristicaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InstalacionCaracteristicaService);
  private readonly caracteristicaService = inject(CaracteristicaService);
  private readonly medidaService = inject(MedidaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  @Output() cargandoChange = new EventEmitter<boolean>();

  private id: string = '';
  cargando: boolean = false;
  guardando: boolean = false;

  caracteristicas: InstalacionCaracteristica[] | [];

  modalVisible = false;
  caracteristicasDisponibles: Caracteristica[] = [];
  medidasDisponibles: Medida[] = [];
  cargandoCaracteristicas = true;
  cargandoMedidas = true;

  form: FormGroup = this.fb.group({
    id: [''],
    nombre: ['']
  });

  modalForm: FormGroup = this.fb.group({
    caracteristica: [null, Validators.required],
    medida: [null, Validators.required],
    valor: [null, Validators.required],
    visible: [true, Validators.required]
  });

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');

    this.cargarCaracteristicasDisponibles();
    this.cargarMedidasDisponibles();

    if (this.id) {
      this.cargarDatos(this.id);
    }
  }

  private cargarDatos(id: string): void {
    this.cargando = true;
    this.cargandoChange.emit(true);
    this.cdr.detectChanges();

    this.service.getAll({ idInstalacion: id }).subscribe({
      next: (response: ApiResponse<InstalacionCaracteristica[]>) => {
        this.caracteristicas = response.data ?? [];

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

  abrirModal(): void {
    this.modalForm.setValue({
      caracteristica: null,
      medida: null,
      valor: null,
      visible: true
    });
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
  }

  private cargarCaracteristicasDisponibles(): void {
    this.cargandoCaracteristicas = true;

    this.caracteristicaService.getAll({ activo: true }).subscribe({
      next: (response) => {
        this.caracteristicasDisponibles = response.data || [];
        this.cargandoCaracteristicas = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar características', err);
        this.cargandoCaracteristicas = false;
        this.cdr.detectChanges();
      }
    });
  }

  private cargarMedidasDisponibles(): void {
    this.cargandoMedidas = true;

    this.medidaService.getAll({ activo: true }).subscribe({
      next: (response) => {
        this.medidasDisponibles = response.data || [];
        this.cargandoMedidas = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar medidas', err);
        this.cargandoMedidas = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarEstado(id: number) {
    this.cargando = true;

    this.service.cambiarEstado(id).subscribe({
      next: () => {
        const caracteristica = this.caracteristicas.find(p => p.id === id);
        if (caracteristica) {
          caracteristica.visible = !caracteristica.visible;
        }

        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Se ha actualizado el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarVisible(id: number) {
    this.cargando = true;

    this.service.cambiarEstado(id).subscribe({
      next: () => {
        const caracteristica = this.caracteristicas.find(p => p.id === id);
        if (caracteristica) {
          caracteristica.visible = !caracteristica.visible;
        }

        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Se ha actualizado el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(caracteristica: InstalacionCaracteristica) {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${caracteristica.medida.nombre}</strong>"?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(caracteristica.id)
    });
  }

  private borrarRegistro(id: number): void {
    this.service.borrarRegistro(id).subscribe({
      next: () => {
        this.caracteristicas = this.caracteristicas.filter(t => t.id !== id);
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
