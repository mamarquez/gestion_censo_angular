import { ChangeDetectorRef, Component, DestroyRef, effect, EventEmitter, inject, input, model, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { InstalacionRutaCoordenadaService } from '../../../services/instalacionRutaCoordenada.service';
import { InstalacionRutaCoordenada } from '../../../models/instalacionRutaCoordenada';
import { mensajesUtil } from '../../../utils/mensajes.util';

@Component({
  standalone: true,
  selector: 'app-modal-coordenada',
  imports: [
    ReactiveFormsModule,
    Dialog,
    Button,
    InputNumber,
    PrimeTemplate
  ],
  providers: [MessageService],
  templateUrl: './modal-coordenada.component.html'
})
export class ModalCoordenadaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InstalacionRutaCoordenadaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  idRuta = input.required<number>();
  coordenada = input<InstalacionRutaCoordenada | null>(null);
  modalVisible = model<boolean>(false);
  @Output() guardado = new EventEmitter<void>();

  guardando = false;

  get esEdicion(): boolean {
    return !!this.coordenada()?.id;
  }

  modalForm: FormGroup = this.fb.group({
    x: [null, Validators.required],
    y: [null, Validators.required]
  });

  constructor() {
    effect(() => {
      if (this.modalVisible()) {
        const coordenada = this.coordenada();

        this.modalForm.reset({
          x: coordenada?.x ?? null,
          y: coordenada?.y ?? null
        });
      }
    });
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

    const valores = this.modalForm.value;
    const idExistente = this.coordenada()?.id;

    const peticion = idExistente
      ? this.service.actualizar(idExistente, this.idRuta(), valores)
      : this.service.crear(this.idRuta(), valores);

    peticion
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          mensajesUtil(this.messageService, 'success', idExistente ? 'update' : 'add');
          this.guardando = false;
          this.cerrarModal();
          this.guardado.emit();
        },
        error: (err) => {
          console.error('Error al guardar la coordenada', err);
          mensajesUtil(this.messageService, 'error', 'error');
          this.guardando = false;
          this.cdr.detectChanges();
        }
      });
  }
}
