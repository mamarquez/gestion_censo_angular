import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { Usuario } from '../../models/usuario';
import { UsuarioService } from '../../services/usuario.service';


@Component({
  selector: 'app-usuarios',
  imports: [TableModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css',
})
export class UsuarioComponent  implements OnInit {

  private readonly usuarioService = inject(UsuarioService);
  private readonly cdr = inject(ChangeDetectorRef);

  usuarios: Usuario[] = [];
  cargando: boolean = true;
  
  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuarioService.getAll().subscribe({
      next: (response) => {
        this.usuarios = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar municipios', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
