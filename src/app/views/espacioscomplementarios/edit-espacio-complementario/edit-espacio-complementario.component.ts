import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { InputText } from 'primeng/inputtext';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { EspacioComplementarioService } from '../../../services/espaciocomplementario.service';
import { MessageService } from 'primeng/api';
import { DialogService } from '../../../services/dialog.service';
import { EspacioComplementario } from '../../../models/espaciocomplementario';

import { Button } from 'primeng/button';
import { Fieldset } from 'primeng/fieldset';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Heading,
  Link,
  List,
  Undo
} from 'ckeditor5';

import coreTranslations from 'ckeditor5/translations/es.js';
import 'ckeditor5/ckeditor5.css';

/**
 * @version 1.0.0
 */

@Component({
  standalone: true,
  selector: 'app-edit-espacio-complementario',
  imports: [
    ReactiveFormsModule,
    InputText,
    Button,
    Fieldset,
    CKEditorModule
  ],
  templateUrl: './edit-espacio-complementario.component.html'
})
export class EditEspacioComplementarioComponent {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(EspacioComplementarioService);
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

  cargando = false;
  guardando = false;

  form: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', [Validators.required, Validators.maxLength(EspacioComplementario.campos.nombre.maxLength)]],
    descripcion: [null],
    activo: [true]
  });
}
