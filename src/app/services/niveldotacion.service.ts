import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AUTH } from '../auth/auth.constants';
import { NivelDotacion } from '../models/niveldotacion';
import { ApiResponse } from '../models/apiresponse';


@Injectable({
  providedIn: 'root'
})
export class NivelDotacionService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/nivelesdotaciones`;


   /**
   * Obtener todos los niveles dotaciones
   */
  getAll(): Observable<ApiResponse<NivelDotacion[]>> {
    return this.http.get<ApiResponse<NivelDotacion[]>>(this.api);
  }
}
