import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Usuario } from '../../models/usuario';
import { UsuarioService } from '../../services/usuario.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogService } from '../../services/dialog.service';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { Tag } from 'primeng/tag';
import { AccionesTablaComponent } from '../../utils/acciones-tabla/acciones-tabla.component';


@Component({
  standalone: true,
  selector: 'app-usuario',
  imports: [TableModule, Button, InputText, ReactiveFormsModule, ConfirmDialogModule, TooltipModule, Tag, AccionesTablaComponent],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})
export class UsuarioComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UsuarioService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(DialogService);

  usuarios: Usuario [] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargar();
  }

  form: FormGroup = this.fb.group({
    id: [''],
    nombre: [''],
    apellido1: [''],
    apellido2: [''],
    valor: [''],
    activo: ['']
  });

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
          this.usuarios = response.data;
        } else {
          this.usuarios = [];
        }

        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando provincias:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar los roles' });
        this.cargando = false;
        this.usuarios = [];
      }
    });
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.usuarios = response.data || [];
        console.log(this.usuarios);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar menús', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: string): void {
    this.cargando = true;

    this.service.cambiarEstado(id).subscribe({
      next: () => {
        const usuario = this.usuarios.find(p => p.id === id);
        if (usuario) {
          usuario.activo = !usuario.activo;
        }

        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Se ha actualizado el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cambiar el estado del menu', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el estado' });
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarBorrado(registro: Usuario): void {
    this.dialog.confirmar({
      mensaje: `¿Deseas eliminar "<strong>${registro.nombre}"</strong>?`,
      titulo: 'Confirmar eliminación',
      labelAceptar: 'Sí, eliminar',
      onAccept: () => this.borrarRegistro(registro.id)
    });
  }

  private borrarRegistro(id: string): void {
    this.cargando = true;

    this.service.borrarRegistro(id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(p => p.id !== id);
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
