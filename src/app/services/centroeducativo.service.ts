import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CentroEducativo } from '../models/centroeducativo';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';

@Injectable({
  providedIn: 'root'
})
export class CentroEducativoService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/centroseducativos`;


   /**
   * Obtener actividades deportivas
   */
  getAll(): Observable<ApiResponse<CentroEducativo[]>> {
    return this.http.get<ApiResponse<CentroEducativo[]>>(this.api);
  }
}
