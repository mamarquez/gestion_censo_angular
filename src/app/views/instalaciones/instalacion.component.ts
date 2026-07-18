import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { Instalacion } from '../../models/instalacion';
import { InstalacionService } from '../../services/instalacion.service';

@Component({
  selector: 'app-instalaciones',
  imports: [TableModule],
  templateUrl: './instalacion.component.html',
  styleUrl: './auditoria.component.css',
})
export class InstalacionComponent implements OnInit {

  private readonly service = inject(InstalacionService);
  private readonly cdr = inject(ChangeDetectorRef);

  instalaciones: Instalacion [] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.instalaciones = response.data || [];
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
