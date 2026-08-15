import { ChangeDetectorRef, Component, DestroyRef, EventEmitter, inject, model, OnInit, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InstalacionService } from '../../../../../services/instalacion.service';
import { MessageService } from 'primeng/api';
import { DialogService } from '../../../../../services/dialog.service';
import { Instalacion } from '../../../../../models/instalacion';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from '../../../../../models/apiresponse';
import { SelectModule } from 'primeng/select';
import { Provincia } from '../../../../../models/provincia';
import { Municipio } from '../../../../../models/municipio';
import { SelectComunidadComponent } from '../../../../../components/select-comunidad/select-comunidad.component';
import { SelectProvinciaComponent } from '../../../../../components/select-provincia/select-provincia.component';
import { SelectMunicipioComponent } from '../../../../../components/select-municipio/select-provincia.component';
import { InputText } from 'primeng/inputtext';

@Component({
  standalone: true,
  selector: 'app-datos-instalaciones',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CheckboxModule,
    ButtonModule,
    ToastModule,
    SelectModule,
    SelectComunidadComponent,
    SelectProvinciaComponent,
    SelectMunicipioComponent,
    InputText
  ],
  providers: [MessageService],
  templateUrl: './datos.component.html'
})
export class DatosComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InstalacionService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);

  idInstalacion = model.required<string>();
  @Output() cargandoChange = new EventEmitter<boolean>();

  private id: string | null = null;
  instalacion: Instalacion | null;
  provincias: Provincia[] | [];
  municipios: Municipio[] | [];
  cargando = false;
  guardando = false;

  form: FormGroup = this.fb.group({
    id: [''],
    codigo: ['', Validators.required],
    nombre: ['', Validators.required],
    nombrePopular: [''],
    direccion: [''],
    id_comunidad: ['', Validators.required],
    id_provincia: ['', Validators.required],
    id_municipio: ['', Validators.required],
    referencia_catastral: ['', Validators.maxLength(20)],
    cp: ['', Validators.maxLength(5)],
    email: [''],
    web: [''],
    observaciones: ['']
  });

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.idInstalacion.set(this.id);

    if (this.id) {
      this.cargarDatos(this.id);
    }
  }

  private cargarDatos(id: string): void {
    this.cargando = true;
    this.cargandoChange.emit(true);
    this.cdr.detectChanges();

    this.service.get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response: ApiResponse<Instalacion>) => {
        this.instalacion = response.data ?? null;

        if (this.instalacion) {
          this.form.patchValue({
            id: this.instalacion.id,
            codigo: this.instalacion.codigo,
            nombre: this.instalacion.nombre,
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
          });
        }
        this.cargando = false;
        this.cargandoChange.emit(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar instalación', err);
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
}
