import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EspacioDeportivo } from '../models/espaciodeportivo';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';


@Injectable({
  providedIn: 'root'
})
export class EspacioDeportivoService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/espaciosdeportivos`;


   /**
   * Obtener todos los espacios deportivos
   */
  getAll(): Observable<ApiResponse<EspacioDeportivo[]>> {
    return this.http.get<ApiResponse<EspacioDeportivo[]>>(this.api);
  }
}
