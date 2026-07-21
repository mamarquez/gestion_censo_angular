import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { Gestor } from '../../models/gestor';
import { GestorService } from '../../services/gestor.service';

@Component({
  selector: 'app-gestor',
  imports: [TableModule],
  templateUrl: './cerramiento.component.html',
  styleUrl: './iluminacion.component.css',
})
export class GestorComponent implements OnInit {

  private readonly service = inject(GestorService);
  private readonly cdr = inject(ChangeDetectorRef);

  gestores: Gestor [] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.gestores = response.data || [];
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
