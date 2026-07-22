import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { EstadoUso } from '../../models/estadouso';
import { EstadoUsoService } from '../../services/estadouso.service';

@Component({
  selector: 'app-estado-uso',
  imports: [TableModule],
  templateUrl: './estadouso.component.html',
  styleUrl: './estadouso.component.css',
})
export class EstadoUsoComponent implements OnInit {

  private readonly service = inject(EstadoUsoService);
  private readonly cdr = inject(ChangeDetectorRef);

  estadosusos: EstadoUso [] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.estadosusos = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar gestores', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

}
