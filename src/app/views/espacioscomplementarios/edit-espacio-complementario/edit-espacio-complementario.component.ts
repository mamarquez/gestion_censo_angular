import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EspacioComplementarioService } from '../../../services/espaciocomplementario.service';
import { MessageService } from 'primeng/api';
import { DialogService } from '../../../services/dialog.service';
import { EspacioComplementario } from '../../../models/espaciocomplementario';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { AccionesTablaComponent } from '../../../utils/acciones-tabla/acciones-tabla.component';
import { EditModalComponent } from '../../../components/modal/edit-modal/edit-modal.component';
import { Truncar } from '../../../pipe/trucar.pipe';

/**
 * @version 1.0.0
 */

@Component({
  standalone: true,
  selector: 'app-edit-espacio-complementario',
  imports: [
    InputText,
    ReactiveFormsModule,
    Button
  ],
  templateUrl: './edit-espacio-complementario.component.html'
})
export class EditEspacioComplementarioComponent {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(EspacioComplementarioService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);

  cargando = false;

  form: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', [Validators.required, Validators.maxLength(EspacioComplementario.campos.nombre.maxLength) ]],
    descripcion: [null],
    activo: [true]
  });

}
