import { Component } from '@angular/core';
import { ErrorPageComponent } from '../error-page/error-page.component';

@Component({
  standalone: true,
  selector: 'app-not-found',
  imports: [ErrorPageComponent],
  templateUrl: './not-found.component.html'
})
export class NotFoundComponent {
}
