import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EspacioComplementarioService } from '../../../services/espaciocomplementario.service';
import { MessageService } from 'primeng/api';
import { EspacioComplementario } from '../../../models/espaciocomplementario';
import { Button } from 'primeng/button';
import { Fieldset } from 'primeng/fieldset';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { Bold, ClassicEditor, Essentials, Heading, Italic, Link, List, Paragraph, Undo } from 'ckeditor5';
import coreTranslations from 'ckeditor5/translations/es.js';
import 'ckeditor5/ckeditor5.css';
import { mensajesUtil } from '../../../utils/mensajes.util';
import { LoaderComponent } from '../../../layouts/loader/loader.component';
import { TableModule } from 'primeng/table';
import { FluidModule } from 'primeng/fluid';
import { finalize, forkJoin } from 'rxjs';
import { CaracteristicaService } from '../../../services/caracteristica.service';
import { Caracteristica } from '../../../models/caracteristica';

/**
 * @version 1.1.0
 */

@Component({
  standalone: true,
  selector: 'app-edit-espacio-complementario',
  imports: [
    ReactiveFormsModule,
    InputText,
    Button,
    Fieldset,
    CKEditorModule,
    TableModule,
    FluidModule
  ],
  templateUrl: './edit-espacio-complementario.component.html',
  styleUrl: './edit-espacio-complementario.component.css'
})
export class EditEspacioComplementarioComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(EspacioComplementarioService);
  private readonly serviceCaracteristica = inject(CaracteristicaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  public Editor = ClassicEditor;

  public config = {
    licenseKey: 'GPL',
    language: 'es',
    translations: [
      coreTranslations
    ],
    plugins: [
      Essentials,
      Paragraph,
      Bold,
      Italic,
      Heading,
      Link,
      List,
      Undo
    ],

    toolbar: [
      'undo',
      'redo',
      '|',
      'heading',
      '|',
      'bold',
      'italic',
      '|',
      'link',
      '|',
      'bulletedList',
      'numberedList'
    ]
  };

  idEspacioComplementario: number | null = null;
  caracteristicasEspacioComplementario: Caracteristica[] = [];
  cargando = false;
  guardando = false;

  form: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', [Validators.required, Validators.maxLength(EspacioComplementario.campos.nombre.maxLength)]],
    descripcion: [null],
    activo: [true]
  });

  get esEdicion(): boolean {
    return this.idEspacioComplementario !== null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.idEspacioComplementario = Number(id);
      this.cargar(this.idEspacioComplementario);
    }
  }

  private cargar(id: number): void {
    if (!this.idEspacioComplementario) {
      return;
    }

    this.cargando = true;

    forkJoin({
      espacio: this.service.get(String(id)),
      caracteristicas: this.serviceCaracteristica.getAll(id)
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.cargando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: ({ espacio, caracteristicas }) => {
          if (caracteristicas?.data) {
            this.caracteristicasEspacioComplementario = Array.isArray(caracteristicas.data)
              ? caracteristicas.data
              : [];
          }

          if (espacio?.data) {
            this.form.patchValue(espacio.data);
          }
        },
        error: (err) => {
          console.error('Error al cargar el espacio complementario y características', err);
          mensajesUtil(this.messageService, 'error', 'carga');
        }
      });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;

    const datos = this.form.value;
    const peticion = this.esEdicion ? this.service.updateRegistro(datos) : this.service.addRegistro(datos);

    peticion
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.guardando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          mensajesUtil(this.messageService, 'success', this.esEdicion ? 'update' : 'add');
          this.router.navigate(['/espaciosdeportivos']);
        },
        error: (err) => {
          console.error('Error al guardar el espacio complementario', err);
          mensajesUtil(this.messageService, 'error', 'error');
        }
      });
  }

  cancelar(): void {
    this.router.navigate(['/espacioscomplementarios']);
  }

}
