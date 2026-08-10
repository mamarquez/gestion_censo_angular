import { ChangeDetectorRef, Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from '../../../../../../models/apiresponse';
import { EspacioDeportivo } from '../../../../../../models/espaciodeportivo';
import { EspacioDeportivoService } from '../../../../../../services/espaciodeportivo.service';
import { MessageService } from 'primeng/api';
import {
  ListCaracteristicasComponent
} from '../../../../../../components/caracteristica/list/caracteristicas.component';
import { FieldsetModule } from 'primeng/fieldset';

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
  private readonly service = inject(EspacioDeportivoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);

  @Output() cargandoChange = new EventEmitter<boolean>();

  private id: string | null = null;
  espacioDeportivo: EspacioDeportivo;
  cargando = false;
  guardando = false;

  form: FormGroup = this.fb.group({
    id: [''],
    nombre: ['', Validators.required],
    descripcion: [''],
    visible: [''],
    activo: ['']
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

    this.service.get(id).subscribe({
      next: (response: ApiResponse<EspacioDeportivo>) => {
        this.espacioDeportivo = response.data ?? null;

        console.log(this.espacioDeportivo);

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
