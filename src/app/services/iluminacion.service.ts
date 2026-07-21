import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Iluminacion } from '../models/iluminacion';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';


@Injectable({
  providedIn: 'root'
})
export class IluminacionService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/iluminaciones`;


   /**
   * Obtener todas las iluminaciones
   */
  getAll(): Observable<ApiResponse<Iluminacion[]>> {
    return this.http.get<ApiResponse<Iluminacion[]>>(this.api);
  }
}
