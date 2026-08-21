import { Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  selector: 'app-boton-add',
  imports: [
    ButtonModule
  ],
  templateUrl: './boton-add.component.html',
  styleUrl: './boton-add.component.css',
})
export class BotonAddComponent {
  add = output<void>();
}
