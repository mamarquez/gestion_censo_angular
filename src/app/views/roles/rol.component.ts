import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { Rol } from '../../models/rol';
import { RolService } from '../../services/rol.service';

@Component({
  selector: 'app-roles',
  imports: [TableModule],
  templateUrl: './rol.component.html',
  styleUrl: './auditoria.component.css',
})
export class RolComponent implements OnInit {

  private readonly service = inject(RolService);
  private readonly cdr = inject(ChangeDetectorRef);

  roles: Rol [] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.getAll().subscribe({
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
