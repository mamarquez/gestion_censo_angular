import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { Rol } from '../../models/rol';
import { RolService } from '../../services/rol.service';

@Component({
  selector: 'app-roles',
  imports: [TableModule],
  templateUrl: './rol.component.html',
  styleUrl: './caracteristica.component.css',
})
export class RolComponent implements OnInit {

  private readonly rolService = inject(RolService);
  private readonly cdr = inject(ChangeDetectorRef);

  roles: Rol [] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargarInstalaciones();
  }

  cargarInstalaciones(): void {
    this.rolService.getAll().subscribe({
      next: (response) => {
        this.roles = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar instalaciones', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

}
