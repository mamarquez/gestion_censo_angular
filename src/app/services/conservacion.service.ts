import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AUTH } from '../auth/auth.constants';
import { Conservacion } from '../models/conservacion';
import { ApiResponse } from '../models/apiresponse';


@Injectable({
  providedIn: 'root'
})
export class ConservacionService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/conservaciones`;


   /**
   * Obtener todos los estados de conservaciones
   */
  getAll(): Observable<ApiResponse<Conservacion[]>> {
    return this.http.get<ApiResponse<Conservacion[]>>(this.api);
  }
}
