import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { ActividadDeportiva } from '../../models/actividaddeportiva';
import { ActividadDeportivaService } from '../../services/adtividaddeportiva.service';

@Component({
  selector: 'app-actividad-deportiva',
  imports: [TableModule],
  templateUrl: './actividaddeportiva.component.html',
  styleUrl: './actividaddeportiva.component.css',
})
export class ActividadDeportivaComponent implements OnInit {

  private readonly service = inject(ActividadDeportivaService);
  private readonly cdr = inject(ChangeDetectorRef);

  actividadesDeportivas: ActividadDeportiva [] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.actividadesDeportivas = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar actividades deportivas', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

}
