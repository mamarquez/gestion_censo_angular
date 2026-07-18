import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Caracteristica } from '../models/caracteristica';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';


@Injectable({
  providedIn: 'root'
})
export class CaracteristicaService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/caracteristicas`;


   /**
   * Obtener caracteristicas
   */
  getAll(): Observable<ApiResponse<Caracteristica[]>> {
    return this.http.get<ApiResponse<Caracteristica[]>>(this.api);
  }
}
