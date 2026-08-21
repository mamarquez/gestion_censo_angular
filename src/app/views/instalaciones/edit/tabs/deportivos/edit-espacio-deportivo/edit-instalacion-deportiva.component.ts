import { ChangeDetectorRef, Component, DestroyRef, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiResponse } from '../../../../../../models/apiresponse';
import { MessageService } from 'primeng/api';
import {
  ListCaracteristicasComponent
} from '../../../../../../components/caracteristica/list/caracteristicas.component';
import { FieldsetModule } from 'primeng/fieldset';
import { InstalacionEspacioDeportivo } from '../../../../../../models/instalacionEspacioDeportivo';
import { InstalacionEspacioDeportivoService } from '../../../../../../services/instalacionEspacioDeportivo.service';
import { EditModalComponent } from '../../../../../../components/modal/edit-modal/edit-modal.component';
import { mensajesUtil } from '../../../../../../utils/mensajes.util';

@Component({
  standalone: true,
  selector: 'app-edit-instalacion-deportiva',
  imports: [
    Button,
    InputText,
    ReactiveFormsModule,
    FieldsetModule,
    ListCaracteristicasComponent,
    EditModalComponent
  ],
  templateUrl: './edit-instalacion-deportiva.component.html'
})
export class EditInstalacionDeportivaComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InstalacionEspacioDeportivoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  @Output() cargandoChange = new EventEmitter<boolean>();

  private id: string | null = null;
  espacioDeportivo: InstalacionEspacioDeportivo = null;
  cargando = false;
  guardando = false;
  modalVisible = false;

  form: FormGroup = this.fb.group({
    id: [''],
    nombre: ['', Validators.required],
    descripcion: [''],
    visible: [true, Validators.required]
  });

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');

    if (this.id) {
      this.cargar(this.id);
    }
  }

  private cargar(id: string): void {
    this.cargando = true;
    this.cargandoChange.emit(true);

    this.service.get(Number(id))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: ApiResponse<InstalacionEspacioDeportivo>) => {
          this.espacioDeportivo = response.data ?? null;

          if (this.espacioDeportivo) {
            this.form.patchValue({
              id: this.espacioDeportivo.id,
              nombre: this.espacioDeportivo.nombre,
              descripcion: this.espacioDeportivo.descripcion
            });
          }
          this.cargando = false;
          this.cargandoChange.emit(false);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar datos', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar datos' });
          this.cargando = false;
          this.cargandoChange.emit(false);
          this.cdr.detectChanges();
        }
      });
  }

  guardar(espacioDeportivo: InstalacionEspacioDeportivo) {
    this.cargando = true;

    const datos: InstalacionEspacioDeportivo = {
      id: espacioDeportivo.id,
      instalacion: espacioDeportivo.instalacion,
      nombre: espacioDeportivo.nombre,
      descripcion: espacioDeportivo.descripcion,
      visible: espacioDeportivo.visible
    };

    if (datos.id) {
      this.service.update(Number(this.id), datos)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            mensajesUtil(this.messageService, 'success', 'update');
            this.modalVisible = false;
            this.cargando = false;
            this.cargar(this.id);
          },
          error: (err) => {
            console.error('Error al actualizar nivel energético', err);
            mensajesUtil(this.messageService, 'error', 'error');
            this.cargando = false;
          }
        });
    } else {
      this.service.crear(datos)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            mensajesUtil(this.messageService, 'success', 'add');
            this.modalVisible = false;
            this.cargando = false;
            this.cargar(this.id);
          },
          error: (err) => {
            console.error('Error al añadir registro', err);
            mensajesUtil(this.messageService, 'error', 'error');
            this.cargando = false;
          }
        });
    }
  }

}
