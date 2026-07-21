import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AUTH } from '../auth/auth.constants';
import { NivelEnergetico } from '../models/nivelenergetico';
import { ApiResponse } from '../models/apiresponse';


@Injectable({
  providedIn: 'root'
})
export class NivelEnergeticoService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/nivelesenergeticos`;


   /**
   * Obtener todos los estados de conservaciones
   */
  getAll(): Observable<ApiResponse<NivelEnergetico[]>> {
    return this.http.get<ApiResponse<NivelEnergetico[]>>(this.api);
  }
}
