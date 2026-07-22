import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';

import { EspacioComplementario } from '../../models/espaciocomplementario';
import { EspacioComplementarioService } from '../../services/espaciocomplementario.service';

@Component({
  selector: 'app-espacio-complementario',
  imports: [TableModule],
  templateUrl: './espaciocomplementario.component.html',
  styleUrl: './espaciocomplementario.component.css',
})
export class EspacioComplementarioCompoment implements OnInit {

  private readonly service = inject(EspacioComplementarioService);
  private readonly cdr = inject(ChangeDetectorRef);

  espaciosComplementarios: EspacioComplementario [] = [];
  cargando: boolean = true;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.espaciosComplementarios = response.data || [];
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
