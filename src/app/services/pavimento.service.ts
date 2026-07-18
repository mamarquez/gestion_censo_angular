import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Pavimento } from '../models/pavimento';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';


@Injectable({
  providedIn: 'root'
})
export class PavimentoService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/pavimentos`;


   /**
   * Obtener pavimentos
   */
  getAll(): Observable<ApiResponse<Pavimento[]>> {
    return this.http.get<ApiResponse<Pavimento[]>>(this.api);
  }
}
