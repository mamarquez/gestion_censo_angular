import { Component } from '@angular/core';
import { ErrorPageComponent } from '../error-page/error-page.component';

@Component({
  standalone: true,
  selector: 'app-forbidden',
  imports: [ErrorPageComponent],
  templateUrl: './forbidden.component.html'
})
export class ForbiddenComponent {
}
