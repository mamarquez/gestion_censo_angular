import { ChangeDetectorRef, Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogService } from '../../../../../services/dialog.service';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { InstalacionEspacioDeportivoService } from '../../../../../services/instalacionEspacioDeportivo.service';
import { InstalacionEspacioDeportivo } from '../../../../../models/instalacionEspacioDeportivo';
import { AccionesTablaComponent } from '../../../../../utils/acciones-tabla/acciones-tabla.component';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { EspacioDeportivo } from '../../../../../models/espaciodeportivo';
import { mensajesUtil } from '../../../../../utils/mensajes.util';
import { ApiResponseWrapper } from '../../../../../interface/api-response-wrapper.interface';
import { BotonAddComponent } from "../../../../../components/boton-add/boton-add.component";
import { EditModalComponent } from '../../../../../components/modal/edit-modal/edit-modal.component';

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
    TableModule,
    BotonAddComponent,
    EditModalComponent
  ],
  providers: [MessageService],
  templateUrl: './deportivo.component.html'
})
export class DatosEspaciosDeportivosComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InstalacionEspacioDeportivoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);

  cargandoChange = output<boolean>();

  idInstalacion = input.required<string>();
  espacioDeportivo: InstalacionEspacioDeportivo | any = null;
  espaciosDeportivos: InstalacionEspacioDeportivo[] = [];
  cargando = false;
  guardando = false;
  modalVisible = false;

  form: FormGroup = this.fb.group({
    id: [null],
    idInstalacion: ['', Validators.required],
    nombre: ['', [Validators.required, Validators.maxLength(EspacioDeportivo.campos.nombre.maxLength)]],
    descripcion: [null],
    visible: [true]
  });

  ngOnInit() {
    this.cargarDatos(this.idInstalacion());
  }

  private cargarDatos(id: string): void {
    this.cargando = true;
    this.cargandoChange.emit(true);
    this.cdr.detectChanges();

    this.service.getAll({ idInstalacion: id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response: ApiResponseWrapper<InstalacionEspacioDeportivo[]>) => {
        this.espaciosDeportivos = response.data ?? [];

        this.form.patchValue({
          idInstalacion: this.idInstalacion()
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
    this.cargarDatos(this.idInstalacion());
  }

  buscar() {
    const filtros = this.form.value;
    this.cargando = true;

    this.service.getAll(filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        if (response && Array.isArray(response.data)) {
          this.espaciosDeportivos = response.data;
        } else {
          this.espaciosDeportivos = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando espacios deportivos:', err);
        mensajesUtil(this.messageService, 'error', 'cargas');
        this.cargando = false;
        this.espaciosDeportivos = [];
      }
    });
  }

  cambiarVisible(id: number) {
    this.cargando = true;

    this.service.cambiarEstado(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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
    this.service.borrarRegistro(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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
    this.service.get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.espacioDeportivo = response.data ?? null;
          this.modalVisible = this.espacioDeportivo !== null;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar el espacio deportivo', err);
          mensajesUtil(this.messageService, 'error', 'carga');
        }
      });
  }

  abrirModal(): void {
    this.espacioDeportivo = null;
    this.modalVisible = true;
  }

  guardar(valores: any): void {
    this.guardando = true;
    const datos: any = {
      id: valores.id,
      instalacion: valores.instalacion ?? { id: Number(this.idInstalacion()) },
      nombre: valores.nombre,
      descripcion: valores.descripcion,
      visible: valores.visible ?? true
    };

    if (datos.id) {
      this.service.update(Number(datos.id), datos)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.guardadoCorrecto('update'),
          error: (err) => this.guardadoError(err)
        });
    } else {
      this.service.crear(datos)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.guardadoCorrecto('add'),
          error: (err) => this.guardadoError(err)
        });
    }
  }

  private guardadoCorrecto(mensaje: 'update' | 'add'): void {
    mensajesUtil(this.messageService, 'success', mensaje);
    this.modalVisible = false;
    this.guardando = false;
    this.cargarDatos(this.idInstalacion());
  }

  private guardadoError(err: unknown): void {
    console.error('Error al guardar el espacio deportivo', err);
    mensajesUtil(this.messageService, 'error', 'error');
    this.guardando = false;
    this.cdr.detectChanges();
  }

}
