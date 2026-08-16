import { Component } from '@angular/core';
import { ErrorPageComponent } from '../../views/errors/error-page/error-page.component';

@Component({
  standalone: true,
  selector: 'app-access-denied',
  imports: [ErrorPageComponent],
  templateUrl: './access-denied.component.html'
})
export class AccessDeniedComponent {
}
