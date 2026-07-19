import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AUTH } from '../auth/auth.constants';
import { Cerramiento } from '../models/cerramiento';
import { ApiResponse } from '../models/apiresponse';


@Injectable({
  providedIn: 'root'
})
export class CerramientoService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/cerramientos`;


   /**
   * Obtener todos los cerramientos
   */
  getAll(): Observable<ApiResponse<Cerramiento[]>> {
    return this.http.get<ApiResponse<Cerramiento[]>>(this.api);
  }
}
