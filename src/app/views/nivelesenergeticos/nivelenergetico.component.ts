import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { NivelEnergetico } from '../../models/nivelenergetico';
import { NivelEnergeticoService } from '../../services/nivelenergetico.service';

@Component({
  selector: 'app-cerramientos',
  imports: [TableModule],
  templateUrl: './nivelenergetico.component.html',
  styleUrl: './conservacion.component.css',
})
export class NivelEnergeticoComponent implements OnInit {

  private readonly service = inject(NivelEnergeticoService);
  private readonly cdr = inject(ChangeDetectorRef);

  nivelesEnergeticos: NivelEnergetico [] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.nivelesEnergeticos = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar niveles energéticos', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

}
