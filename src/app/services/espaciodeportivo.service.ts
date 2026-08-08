import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EspacioDeportivo } from '../models/espaciodeportivo';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';

@Injectable({
  providedIn: 'root'
})
export class EspacioDeportivoService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/instalacionesespaciosdeportivos`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener datos
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<EspacioDeportivo[]>> {
    return this.http.get<ApiResponseWrapper<EspacioDeportivo[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtener dato
   */
  get(id: any): Observable<ApiResponseWrapper<EspacioDeportivo>> {
    return this.http.get<ApiResponseWrapper<EspacioDeportivo>>(`${this.api}/${id}`, {
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<EspacioDeportivo>> {
    return this.http.patch<ApiResponseWrapper<EspacioDeportivo>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<EspacioDeportivo>> {
    return this.http.delete<ApiResponseWrapper<EspacioDeportivo>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
