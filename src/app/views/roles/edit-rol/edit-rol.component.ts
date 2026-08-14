import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { LoaderComponent } from '../../../layouts/loader/loader.component';
import { RolService } from '../../../services/rol.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { RolTipoService } from '../../../services/rol-tipo.service';
import { RolPermisoService } from '../../../services/rol-permiso.service';
import { RolPermisoModel } from '../../../models/rol-permiso-model';
import { ActivatedRoute } from '@angular/router';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';
import { MessageService } from 'primeng/api';
import { DialogService } from '../../../services/dialog.service';
import { mensajesUtil } from '../../../utils/mensajes.util';

@Component({
  standalone: true,
  selector: 'app-edit-rol',
  imports: [
    ReactiveFormsModule,
    LoaderComponent,
    TableModule
  ],
  templateUrl: './edit-rol.component.html'
})
export class EditRolComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(RolPermisoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  private idRol: string | null = null;
  permisos: RolPermisoModel[] = [];
  nombreRol: string = '';
  cargando: boolean = false;

  form: FormGroup = this.fb.group({

  });

  ngOnInit() {
    this.idRol = this.route.snapshot.paramMap.get('id');

    if (this.idRol) {
      this.cargar();
    }
  }

  cargar() {
    this.cargando = true;

    this.service.getAll({ idRol: this.idRol}).subscribe({
      next: (response: ApiResponseWrapper<RolPermisoModel[]>) => {
        this.permisos = response.data || [];
        this.nombreRol = this.permisos[0]?.rol?.nombre ?? '';
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando permisos:', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cargando = false;
        this.permisos = [];
        this.cdr.detectChanges();
      }
    });
  }

}
