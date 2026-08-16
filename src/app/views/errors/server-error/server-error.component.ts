import { Component } from '@angular/core';
import { ErrorPageComponent } from '../error-page/error-page.component';

@Component({
  standalone: true,
  selector: 'app-server-error',
  imports: [ErrorPageComponent],
  templateUrl: './server-error.component.html'
})
export class ServerErrorComponent {
}
