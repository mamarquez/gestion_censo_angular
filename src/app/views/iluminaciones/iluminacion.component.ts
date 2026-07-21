import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { Iluminacion } from '../../models/iluminacion';
import { IluminacionService } from '../../services/iluminacion.service';

@Component({
  selector: 'app-iluminacion',
  imports: [TableModule],
  templateUrl: './iluminacion.component.html',
  styleUrl: './iluminacion.component.css',
})
export class IluminacionComponent implements OnInit {

  private readonly service = inject(IluminacionService);
  private readonly cdr = inject(ChangeDetectorRef);

  iluminaciones: Iluminacion [] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.iluminaciones = response.data || [];
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
