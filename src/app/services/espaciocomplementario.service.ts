import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EspacioComplementario } from '../models/espaciocomplementario';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';


@Injectable({
  providedIn: 'root'
})
export class EspacioComplementarioService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/espacioscomplementarios`;


   /**
   * Obtener todos los espacios deportivos
   */
  getAll(): Observable<ApiResponse<EspacioComplementario[]>> {
    return this.http.get<ApiResponse<EspacioComplementario[]>>(this.api);
  }
}
