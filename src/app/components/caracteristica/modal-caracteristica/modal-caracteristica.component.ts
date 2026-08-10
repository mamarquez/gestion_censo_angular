import { ChangeDetectorRef, Component, effect, EventEmitter, inject, Input, model, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PrimeTemplate, MessageService } from 'primeng/api';
import { InstalacionCaracteristicaService } from '../../../services/instalacionCaracteristica.service';
import { CaracteristicaService } from '../../../services/caracteristica.service';
import { MedidaService } from '../../../services/medida.service';
import { Caracteristica } from '../../../models/caracteristica';
import { Medida } from '../../../models/medida';
import { InstalacionCaracteristica } from '../../../models/instalacionCaracteristica';

@Component({
  standalone: true,
  selector: 'app-modal-caracteristica',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    Dialog,
    Button,
    InputText,
    SelectModule,
    PrimeTemplate
  ],
  providers: [MessageService],
  templateUrl: './modal-caracteristica.component.html',
  styleUrl: './modal-caracteristica.component.css',
})
export class ModalCaracteristicaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InstalacionCaracteristicaService);
  private readonly caracteristicaService = inject(CaracteristicaService);
  private readonly medidaService = inject(MedidaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);

  @Input() idInstalacion: string = '';
  modalVisible = model<boolean>(false);
  @Output() guardado = new EventEmitter<void>();

  guardando = false;
  caracteristicasDisponibles: Caracteristica[] = [];
  medidasDisponibles: Medida[] = [];
  cargandoCaracteristicas = true;
  cargandoMedidas = true;

  modalForm: FormGroup = this.fb.group({
    caracteristica: [null, Validators.required],
    medida: [null, Validators.required],
    valor: [null, Validators.required],
    visible: [true, Validators.required]
  });

  constructor() {
    effect(() => {
      if (this.modalVisible()) {
        this.modalForm.setValue({
          caracteristica: null,
          medida: null,
          valor: null,
          visible: true
        });

        if (this.caracteristicasDisponibles.length === 0) {
          this.cargarCaracteristicasDisponibles();
        }

        if (this.medidasDisponibles.length === 0) {
          this.cargarMedidasDisponibles();
        }
      }
    });
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

  cerrarModal(): void {
    this.modalVisible.set(false);
  }

  guardarModal(): void {
    if (this.modalForm.invalid || !this.idInstalacion) {
      this.modalForm.markAllAsTouched();
      return;
    }

    this.guardando = true;

    const datos: InstalacionCaracteristica = {
      idInstalacion: Number(this.idInstalacion),
      caracteristica: { id: this.modalForm.value.caracteristica } as Caracteristica,
      medida: { id: this.modalForm.value.medida } as Medida,
      valor: this.modalForm.value.valor,
      visible: this.modalForm.value.visible
    };

    this.service.crear(datos).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Añadido', detail: 'Característica añadida correctamente' });
        this.guardando = false;
        this.cerrarModal();
        this.guardado.emit();
      },
      error: (err) => {
        console.error('Error al guardar característica', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar la característica' });
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
