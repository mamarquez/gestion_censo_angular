import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Instalacion } from '../models/instalacion';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';


@Injectable({
  providedIn: 'root'
})
export class InstalacionService {
  
  private readonly http = inject(HttpClient);  
  private readonly api = `${AUTH.API}/instalaciones`;


   /**
   * Obtener todos las instalaciones
   */
  getAll(): Observable<ApiResponse<Instalacion[]>> {
    return this.http.get<ApiResponse<Instalacion[]>>(this.api);
  }
}