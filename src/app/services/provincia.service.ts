import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Provincia } from '../models/provincia';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';


@Injectable({
  providedIn: 'root'
})
export class ProvinciaService {
  
  private readonly http = inject(HttpClient);  
  private readonly api = `${AUTH.API}/provincias`;


   /**
   * Obtener provincias
   */
  getAll(): Observable<ApiResponse<Provincia[]>> {
    return this.http.get<ApiResponse<Provincia[]>>(this.api);
  }
}