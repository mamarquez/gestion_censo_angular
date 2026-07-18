import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Medida } from '../models/medida';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';

@Injectable({
  providedIn: 'root'
})
export class MedidaService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/medidas`;


   /**
   * Obtener medidas
   */
  getAll(): Observable<ApiResponse<Medida[]>> {
    return this.http.get<ApiResponse<Medida[]>>(this.api);
  }
}
