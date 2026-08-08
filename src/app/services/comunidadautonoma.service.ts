import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';
import { ComunidadAutonoma } from '../models/comunidadautonoma';

@Injectable({
  providedIn: 'root'
})
export class ComunidadautonomaService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/comunidadesautonomicas`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener registros
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<ComunidadAutonoma[]>> {
    return this.http.get<ApiResponseWrapper<ComunidadAutonoma[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtiene el registro
   * @param id Id del registro
   */
  get(id: String): Observable<ApiResponseWrapper<ComunidadAutonoma>> {
    return this.http.get<ApiResponseWrapper<ComunidadAutonoma>>(`${this.api}/${id}`, {
      headers: this.headers
    });
  }

}
