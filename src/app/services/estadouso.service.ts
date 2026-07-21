import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EstadoUso } from '../models/estadouso';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';


@Injectable({
  providedIn: 'root'
})
export class EstadoUsoService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/estadosusos`;


   /**
   * Obtener todas las estados de usos
   */
  getAll(): Observable<ApiResponse<EstadoUso[]>> {
    return this.http.get<ApiResponse<EstadoUso[]>>(this.api);
  }
}
