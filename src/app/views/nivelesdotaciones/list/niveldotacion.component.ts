import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { NivelDotacion } from '../../../models/niveldotacion';
import { NivelDotacionService } from '../../../services/niveldotacion.service';
import { Button } from 'primeng/button';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogService } from '../../../services/dialog.service';
import { InputText } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  standalone: true,
  selector: 'app-nivel-dotacion',
  imports: [TableModule, Button, InputText, ReactiveFormsModule, ConfirmDialogModule, TooltipModule],
  templateUrl: './niveldotacion.component.html',
  styleUrl: './niveldotacion.component.css'
})
export class NivelDotacionComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(NivelDotacionService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  nivelesDotaciones: NivelDotacion [] = [];
  cargando: boolean = true;

  form: FormGroup = this.fb.group({
    id: [''],
    nombre: [''],
    descripcion: [''],
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
          this.nivelesDotaciones = response.data;
        } else {
          this.nivelesDotaciones = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando niveles dotaciones', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los gestores'
        });
        this.cargando = false;
        this.nivelesDotaciones = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.nivelesDotaciones = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar niveles educativos', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): void {
    this.cargando = true;

    this.service.cambiarEstado(id).subscribe({
      next: () => {
        const nivelDotacion = this.nivelesDotaciones.find(p => p.id === id);
        if (nivelDotacion) {
          nivelDotacion.activo = !nivelDotacion.activo;
        }

        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Se ha actualizado el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado de nivel energético', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(nivel: NivelDotacion): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${nivel.nombre}"</strong>?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(nivel.id)
    });
  }

  private borrarRegistro(id: number) {
    this.cargando = true;

    this.service.borrarRegistro(id).subscribe({
      next: () => {
        this.nivelesDotaciones = this.nivelesDotaciones.filter(p => p.id !== id);
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: 'Se ha borrado el registro correctamente'
        });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al borrar el registro', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al borrar el registro' });
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });

    this.cargando = false;
  }

}
