import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { NivelDotacion } from '../../models/niveldotacion';
import { NivelDotacionService } from '../../services/niveldotacion.service';

@Component({
  selector: 'app-nivel-dotacion',
  imports: [TableModule],
  templateUrl: './niveldotacion.component.html',
  styleUrl: './niveldotacion.component.css',
})
export class NivelDotacionComponent implements OnInit {

  private readonly service = inject(NivelDotacionService);
  private readonly cdr = inject(ChangeDetectorRef);

  nivelesDotaciones: NivelDotacion [] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.nivelesDotaciones = response.data || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar niveles educativos', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

}
