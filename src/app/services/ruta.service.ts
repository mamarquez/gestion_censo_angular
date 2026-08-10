import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AUTH } from '../auth/auth.constants';
import { Cerramiento } from '../models/cerramiento';
import { ApiResponse } from '../models/apiresponse';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';
import { InstalacionRuta } from '../models/instalacionRuta';

@Injectable({
  providedIn: 'root'
})
export class CerramientoService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/rutas`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener cerramientos
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<InstalacionRuta[]>> {
    return this.http.get<ApiResponseWrapper<InstalacionRuta[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<InstalacionRuta>> {
    return this.http.patch<ApiResponseWrapper<InstalacionRuta>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<InstalacionRuta>> {
    return this.http.delete<ApiResponseWrapper<InstalacionRuta>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
