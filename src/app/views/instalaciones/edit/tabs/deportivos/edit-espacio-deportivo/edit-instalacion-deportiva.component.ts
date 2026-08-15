import { ChangeDetectorRef, Component, DestroyRef, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from '../../../../../../models/apiresponse';
import { MessageService } from 'primeng/api';
import {
  ListCaracteristicasComponent
} from '../../../../../../components/caracteristica/list/caracteristicas.component';
import { FieldsetModule } from 'primeng/fieldset';
import { InstalacionEspacioDeportivo } from '../../../../../../models/instalacionEspacioDeportivo';
import { InstalacionEspacioDeportivoService } from '../../../../../../services/instalacionEspacioDeportivo.service';

@Component({
  standalone: true,
  selector: 'app-edit-instalacion-deportiva',
  imports: [
    Button,
    InputText,
    ReactiveFormsModule,
    FieldsetModule,
    ListCaracteristicasComponent
  ],
  templateUrl: './edit-instalacion-deportiva.component.html'
})
export class EditInstalacionDeportivaComponent implements OnInit {

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

  form: FormGroup = this.fb.group({
    id: [''],
    nombre: ['', Validators.required],
    descripcion: [''],
    visible: [true, Validators.required],
    activo: [true, Validators.required]
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

    this.service.get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response: ApiResponse<InstalacionEspacioDeportivo>) => {
        this.espacioDeportivo = response.data ?? null;

        if (this.espacioDeportivo) {
          this.form.patchValue({
            id: this.espacioDeportivo.id,
            nombre: this.espacioDeportivo.nombre,
            descripcion: this.espacioDeportivo.descripcion
            /*
            nombre_popular: this.instalacion.nombrePopular,
            direccion: this.instalacion.direccion,
            id_comunidad: this.instalacion.comunidad.id,
            id_provincia: this.instalacion.provincia.id,
            id_municipio: this.instalacion.municipio.id,
            referencia_catastral: this.instalacion.referencia_catastral,
            cp: this.instalacion.cp,
            email: this.instalacion.email,
            web: this.instalacion.web,
            observaciones: this.instalacion.observaciones
            */
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

}
