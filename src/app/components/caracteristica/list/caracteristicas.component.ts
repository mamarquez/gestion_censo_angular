import { ChangeDetectorRef, Component, DestroyRef, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { AccionesTablaComponent } from '../../../utils/acciones-tabla/acciones-tabla.component';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DialogService } from '../../../services/dialog.service';
import { InstalacionCaracteristicaService } from '../../../services/instalacionCaracteristica.service';
import { InstalacionCaracteristica } from '../../../models/instalacionCaracteristica';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';
import { EditCaracteristicaModalComponent } from '../edit-caracteristica-modal/edit-caracteristica-modal.component';

@Component({
  standalone: true,
  selector: 'app-list-caracteristicas',
  imports: [
    AccionesTablaComponent,
    FormsModule,
    Button,
    InputText,
    PrimeTemplate,
    ReactiveFormsModule,
    TableModule,
    ToastModule,
    EditCaracteristicaModalComponent
  ],
  providers: [MessageService],
  templateUrl: './caracteristicas.component.html'
})
export class ListCaracteristicasComponent implements OnChanges {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InstalacionCaracteristicaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);

  @Input() idEspacioDeportivo: number | undefined;

  cargando: boolean = false;
  caracteristicas: InstalacionCaracteristica[] = [];
  caracteristicaSeleccionada: InstalacionCaracteristica | null = null;
  modalVisible = false;

  form: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', Validators.required],
    descripcion: [null],
    visible: [true]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idEspacioDeportivo'] && this.idEspacioDeportivo !== undefined) {
      this.cargar();
    }
  }

  private cargar(): void {
    if (this.idEspacioDeportivo === undefined) return;

    this.cargando = true;

    const filtros = {
      ...this.form.value,
      instalacionEspacioDeportivo: this.idEspacioDeportivo
    };

    this.service.getAll(filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response: ApiResponseWrapper<InstalacionCaracteristica[]>) => {
        this.caracteristicas = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar características', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar las características' });
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  limpiar(): void {
    this.form.reset();
    this.cargar();
  }

  buscar(): void {
    this.cargar();
  }

  abrirModal(): void {
    this.caracteristicaSeleccionada = null;
    this.modalVisible = true;
  }

  editar(caracteristica: InstalacionCaracteristica): void {
    this.caracteristicaSeleccionada = caracteristica;
    this.modalVisible = true;
  }

  guardar(valores: InstalacionCaracteristica): void {
    const datos: InstalacionCaracteristica = {
      ...valores,
      idInstalacion: null,
      idEspacioDeportivo: this.idEspacioDeportivo ?? null
    };

    if (datos.id) {
      this.service.update(Number(datos.id), datos)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.guardadoCorrecto('Se ha actualizado la característica'),
          error: (err) => this.guardadoError(err)
        });
    } else {
      this.service.crear(datos)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.guardadoCorrecto('Se ha añadido la característica'),
          error: (err) => this.guardadoError(err)
        });
    }
  }

  private guardadoCorrecto(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Correcto', detail });
    this.modalVisible = false;
    this.cargar();
  }

  private guardadoError(err: unknown): void {
    console.error('Error al guardar la característica', err);
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar la característica' });
    this.cdr.detectChanges();
  }

  cambiarVisible(id: number): void {
    this.cargando = true;

    this.service.cambiarEstado(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        const caracteristica = this.caracteristicas.find(c => c.id === id);
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

  confirmarBorrado(caracteristica: InstalacionCaracteristica): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${caracteristica.medida.nombre}</strong>"?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(caracteristica.id)
    });
  }

  private borrarRegistro(id: number): void {
    this.service.borrarRegistro(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        this.caracteristicas = this.caracteristicas.filter(c => c.id !== id);
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
