import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Auditoria } from '../../../models/auditoria';
import { AuditoriaService } from '../../../services/auditoria.service';
import { Button } from 'primeng/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { InputMaskModule } from 'primeng/inputmask';
import { DatePipe } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';
import { DialogModule } from 'primeng/dialog';
import { SafeHtmlPipe } from 'primeng/menu';
import { mensajesUtil } from '../../../utils/mensajes.util';

/**
 * @version 1.0.1
 */

@Component({
  standalone: true,
  selector: 'app-auditoria',
  imports: [
    TableModule,
    DatePipe,
    Button,
    InputText,
    ReactiveFormsModule,
    DatePickerModule,
    InputMaskModule,
    TagModule,
    SelectModule,
    Tooltip,
    DialogModule,
    SafeHtmlPipe
  ],
  templateUrl: 'auditoria.component.html'
})
export class AuditoriaComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AuditoriaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);

  auditoria: Auditoria = null;
  auditorias: Auditoria[] = [];
  cargando: boolean = true;
  mostrarModal: boolean = false;

  form: FormGroup = this.fb.group({
    id: [null],
    tabla: ['', Validators.required],
    idRegistro: ['', Validators.required],
    operacion: ['', Validators.required],
    idUsuario: ['', Validators.required],
    fecha: ['', Validators.required],
    valor_anterior: ['', Validators.required],
    valor_nuevo: ['', Validators.required],
  });

  operacionesOptions = [
    { label: 'Todos', value: null },
    { label: 'NUEVO', value: 'INSERT' },
    { label: 'ACTUALIZADO', value: 'UPDATE' },
    { label: 'BORRADO', value: 'DELETE' }
  ];

  ngOnInit(): void {
    this.cargar();
  }

  limpiar(): void {
    this.form.reset({
      operacion: null
    });
    this.buscar();
  }

  buscar(): void {
    const filtros = this.form.value;
    this.cargando = true;

    this.service.getAll(filtros).subscribe({
      next: (response) => {
        if (response && Array.isArray(response.data)) {
          this.auditorias = response.data;
        } else {
          this.auditorias = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando auditorias:', err);
        mensajesUtil(this.messageService, 'error', 'cargas');
        this.cargando = false;
        this.auditorias = [];
      }
    });
  }

  private cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.auditorias = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar auditorias', err);
        mensajesUtil(this.messageService, 'error', 'cargas');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  ver(id: string) {
    this.mostrarModal = true;

    this.service.get(id).subscribe({
      next: (response: ApiResponseWrapper<Auditoria>) => {
        this.auditoria = response.data ?? null;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar auditoria', err);
        mensajesUtil(this.messageService, 'error', 'error');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  getSeverity(operacion: string): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (operacion) {
      case 'INSERT':
        return 'success';
      case 'UPDATE':
        return 'warn';
      case 'DELETE':
        return 'danger';
      default:
        return 'secondary';
    }
  }

}
