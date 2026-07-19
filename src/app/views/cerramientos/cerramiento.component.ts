import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { Cerramiento } from '../../models/cerramiento';
import { CerramientoService } from '../../services/cerramiento.service';

@Component({
  selector: 'app-cerramientos',
  imports: [TableModule],
  templateUrl: './cerramiento.component.html',
  styleUrl: './cerramiento.component.css',
})
export class CerramientoComponent implements OnInit {

  private readonly service = inject(CerramientoService);
  private readonly cdr = inject(ChangeDetectorRef);

  cerramientos: Cerramiento [] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.cerramientos = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar cerramientos', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

}
