import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Municipio } from '../models/municipio';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';


@Injectable({
  providedIn: 'root'
})
export class MunicipioService {
  
  private readonly http = inject(HttpClient);  
  private readonly api = `${AUTH.API}/municipios`;


   /**
   * Obtener todos los municipios
   */
  getAll(): Observable<ApiResponse<Municipio[]>> {
    return this.http.get<ApiResponse<Municipio[]>>(this.api);
  }
}