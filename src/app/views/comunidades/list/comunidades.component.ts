import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { AccionesTablaComponent } from '../../../utils/acciones-tabla/acciones-tabla.component';
import { MessageService } from 'primeng/api';
import { ComunidadAutonoma } from '../../../models/comunidadautonoma';
import { DialogService } from '../../../services/dialog.service';
import { ComunidadautonomaService } from '../../../services/comunidadautonoma.service';

@Component({
  standalone: true,
  selector: 'app-list-comunidades',
  imports: [TableModule, Button, InputText, ReactiveFormsModule, ConfirmDialogModule, TooltipModule, AccionesTablaComponent],
  templateUrl: 'comunidades.component.html',
  styleUrl: 'comunidades.component.css'
})
export class ListComunidadesComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ComunidadautonomaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  comunidades: ComunidadAutonoma[] = [];
  cargando: boolean = true;

  form: FormGroup = this.fb.group({
    id: [''],
    codigo: [''],
    nombre: [''],
    activo: ['']
  });

  ngOnInit(): void {
    this.cargar();
  }

  limpiar(): void {
    this.form.reset();
    this.buscar();
  }

  buscar(): void {
    const filtros = this.form.value;
    this.cargando = true;

    this.service.getAll(filtros).subscribe({
      next: (response) => {
        if (response && Array.isArray(response.data)) {
          this.comunidades = response.data;
        } else {
          this.comunidades = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando cerramientos:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar cerramientos'
        });
        this.cargando = false;
        this.comunidades = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.comunidades = response.data || [];
        console.log(this.comunidades);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar centros educativos', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

}
