import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { Conservacion } from '../../models/conservacion';
import { ConservacionService } from '../../services/conservacion.service';

@Component({
  selector: 'app-conservaciones',
  imports: [TableModule],
  templateUrl: './conservacion.component.html',
  styleUrl: './conservacion.component.css',
})
export class ConservacionComponent implements OnInit {

  private readonly service = inject(ConservacionService);
  private readonly cdr = inject(ChangeDetectorRef);

  conservaciones: Conservacion [] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.conservaciones = response.data || [];
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
