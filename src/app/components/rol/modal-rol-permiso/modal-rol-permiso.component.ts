import { ChangeDetectorRef, Component, effect, EventEmitter, inject, input, model, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { RolPermisoService } from '../../../services/rol-permiso.service';
import { TipoRolService } from '../../../services/tipo-rol.service';
import { TipoRolModel } from '../../../models/tipo-rol-model';
import { mensajesUtil } from '../../../utils/mensajes.util';

@Component({
  standalone: true,
  selector: 'app-modal-rol-permiso',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    Dialog,
    Button,
    SelectModule,
    PrimeTemplate
  ],
  providers: [MessageService],
  templateUrl: './modal-rol-permiso.component.html'
})
export class ModalRolPermisoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(RolPermisoService);
  private readonly tipoRolService = inject(TipoRolService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);

  idRol = input.required<number>();
  modalVisible = model<boolean>(false);
  @Output() guardado = new EventEmitter<void>();

  guardando = false;
  tiposDisponibles: TipoRolModel[] = [];
  cargandoTipos = true;
  tipoSeleccionado: number | null = null;

  modalForm: FormGroup = this.fb.group({
    tipoRol: [null, Validators.required]
  });

  constructor() {
    effect(() => {
      if (this.modalVisible()) {
        this.modalForm.setValue({ tipoRol: null });
        this.tipoSeleccionado = null;

        if (this.tiposDisponibles.length === 0) {
          this.cargarTiposDisponibles();
        }
      }
    });
  }

  private cargarTiposDisponibles(): void {
    this.cargandoTipos = true;

    this.tipoRolService.getAll().subscribe({
      next: (response) => {
        this.tiposDisponibles = response.data || [];
        this.cargandoTipos = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar los tipos de permiso', err);
        this.cargandoTipos = false;
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarTipo(event: any): void {
    this.tipoSeleccionado = event.value;
    this.modalForm.get('tipoRol')?.setValue(event.value);
  }

  cerrarModal(): void {
    this.modalVisible.set(false);
  }

  guardarModal(): void {
    if (this.modalForm.invalid) {
      this.modalForm.markAllAsTouched();
      return;
    }

    this.guardando = true;

    this.service.crear(this.idRol(), this.modalForm.value.tipoRol).subscribe({
      next: () => {
        mensajesUtil(this.messageService, 'success', 'add');
        this.guardando = false;
        this.cerrarModal();
        this.guardado.emit();
      },
      error: (err) => {
        console.error('Error al asignar el permiso', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
