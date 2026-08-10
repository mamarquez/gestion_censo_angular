import { ChangeDetectorRef, Component, effect, EventEmitter, inject, Input, model, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { InstalacionTelefonoService } from '../../../services/instalaciontelefono.service';
import { InstalacionTelefono } from '../../../models/instalaciontelefono';

@Component({
  standalone: true,
  selector: 'app-modal-telefono',
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
  templateUrl: './modal-telefono.component.html',
  styleUrl: './modal-telefono.component.css',
})
export class ModalTelefonoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InstalacionTelefonoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);

  @Input() idInstalacion: string = '';
  modalVisible = model<boolean>(false);
  @Output() guardado = new EventEmitter<void>();

  guardando = false;

  modalForm: FormGroup = this.fb.group({
    numero: [null, Validators.required],
    contacto: [null],
    notas: [null],
    visible: [true, Validators.required]
  });

  constructor() {
    effect(() => {
      if (this.modalVisible()) {
        this.modalForm.setValue({
          numero: null,
          contacto: null,
          notas: null,
          visible: true
        });
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

    const datos: Partial<InstalacionTelefono> = {
      ...this.modalForm.value,
      idInstalacion: Number(this.idInstalacion)
    };

    this.service.crear(datos).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Añadido', detail: 'Teléfono añadido correctamente' });
        this.guardando = false;
        this.cerrarModal();
        this.guardado.emit();
      },
      error: (err) => {
        console.error('Error al guardar teléfono', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar el teléfono' });
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
