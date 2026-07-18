import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ActividadDeportiva } from '../models/actividaddeportiva';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';

@Injectable({
  providedIn: 'root'
})
export class ActividadDeportivaService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/actividadesdeportivas`;


   /**
   * Obtener actividades deportivas
   */
  getAll(): Observable<ApiResponse<ActividadDeportiva[]>> {
    return this.http.get<ApiResponse<ActividadDeportiva[]>>(this.api);
  }
}
