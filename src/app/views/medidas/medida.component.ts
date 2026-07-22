import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { Medida } from '../../models/medida';
import { MedidaService } from '../../services/medida.service';

@Component({
  selector: 'app-medida',
  imports: [TableModule],
  templateUrl: './medida.component.html',
  styleUrl: './medida.component.css',
})
export class MedidaComponent implements OnInit {

  private readonly service = inject(MedidaService);
  private readonly cdr = inject(ChangeDetectorRef);

  medidas: Medida [] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.medidas = response.data || [];
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
