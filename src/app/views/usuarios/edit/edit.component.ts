import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Listbox } from 'primeng/listbox';
import { Fieldset } from 'primeng/fieldset';
import { Fluid } from 'primeng/fluid';
import { LoaderComponent } from '../../../layouts/loader/loader.component';
import { RolesComponent } from './tabs/roles/roles.component';
import { DatosComponent } from './tabs/datos/datos.component';

/**
 * @version 1.0.2
 */

@Component({
  standalone: true,
  selector: 'app-edit-usuario',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    CheckboxModule,
    ButtonModule,
    ToastModule,
    Listbox,
    Fieldset,
    Fluid,
    LoaderComponent,
    DatosComponent,
    RolesComponent
  ],
  providers: [MessageService],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css'
})
export class EditUsuarioComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);

  tabActiva: 'datos' | 'roles' = 'datos';

  idUsuario = signal<string>('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.idUsuario.set(id);
    }
  }

  seleccionarTab(tab: 'datos' | 'roles'): void {
    this.tabActiva = tab;
  }

}
