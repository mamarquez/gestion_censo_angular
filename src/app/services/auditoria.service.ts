import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Auditoria } from '../models/auditoria';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';


@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/auditorias`;


   /**
   * Obtener provincias
   */
  getAll(): Observable<ApiResponse<Auditoria[]>> {
    return this.http.get<ApiResponse<Auditoria[]>>(this.api);
  }
}
