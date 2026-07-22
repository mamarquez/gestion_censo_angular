import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { EspacioDeportivo } from '../../models/espaciodeportivo';
import { EspacioDeportivoService } from '../../services/espaciodeportivo.service';

@Component({
  selector: 'app-espacio-deportivo',
  imports: [TableModule],
  templateUrl: './espaciodeportivo.component.html',
  styleUrl: './espaciodeportivo.component.css',
})
export class EspacioDeportivoCompoment implements OnInit {

  private readonly service = inject(EspacioDeportivoService);
  private readonly cdr = inject(ChangeDetectorRef);

  espaciosDeportivos: EspacioDeportivo [] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.espaciosDeportivos = response.data || [];
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
