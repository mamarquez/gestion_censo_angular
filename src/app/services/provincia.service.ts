import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Provincia } from '../models/provincia';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';

export interface ApiResponseWrapper<T> {
  message: string;
  data: T;
  success: boolean;
  fieldErrors: any;
}

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

  /**
   * Obtener provincias filtradas
   * @param filtros
   */
  getProvincias(filtros?: any): Observable<ApiResponseWrapper<Provincia[]>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      ine: filtros?.ine || null,
      nombre: filtros?.nombre || null,
      activo: filtros?.activo === '1' ? true : (filtros?.activo === '0' ? false : null)
    };

    return this.http.post<ApiResponseWrapper<Provincia[]>>(this.api + '/filtrar', body, { headers });
  }
}
