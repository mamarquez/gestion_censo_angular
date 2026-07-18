import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { Caracteristica } from '../../models/caracteristica';
import { CaracteristicaService } from '../../services/caracteristica.service';

@Component({
  selector: 'app-caracteristicas',
  imports: [TableModule],
  templateUrl: './caracteristica.component.html',
  styleUrl: './caracteristica.component.css',
})
export class CaracteristicaComponent implements OnInit {

  private readonly rolService = inject(CaracteristicaService);
  private readonly cdr = inject(ChangeDetectorRef);

  caracteristicas: Caracteristica [] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargarInstalaciones();
  }

  cargarInstalaciones(): void {
    this.rolService.getAll().subscribe({
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
