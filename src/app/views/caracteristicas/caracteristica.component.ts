import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { Caracteristica } from '../../models/caracteristica';
import { CaracteristicaService } from '../../services/caracteristica.service';

@Component({
  selector: 'app-caracteristica',
  imports: [TableModule],
  templateUrl: './caracteristica.component.html',
  styleUrl: './pavimento.component.css',
})
export class CaracteristicaComponent implements OnInit {

  private readonly service = inject(CaracteristicaService);
  private readonly cdr = inject(ChangeDetectorRef);

  caracteristicas: Caracteristica [] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.caracteristicas = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar características', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

}
