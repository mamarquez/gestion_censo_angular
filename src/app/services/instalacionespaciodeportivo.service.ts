import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';
import { InstalacionEspacioDeportivo } from '../models/instalacionEspacioDeportivo';

@Injectable({
  providedIn: 'root'
})
export class InstalacionespaciodeportivoService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/instalacionesespaciosdeportivos`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener todos los espacios deportivos de instalaciones
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<InstalacionEspacioDeportivo[]>> {
    return this.http.get<ApiResponseWrapper<InstalacionEspacioDeportivo[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtener espacios deportivos de una instalación
   */
  get(id?: any): Observable<ApiResponseWrapper<InstalacionEspacioDeportivo[]>> {
    return this.http.get<ApiResponseWrapper<InstalacionEspacioDeportivo[]>>(`${this.api}/${id}`, {
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponse<InstalacionEspacioDeportivo>> {
    return this.http.patch<ApiResponse<InstalacionEspacioDeportivo>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Crea un nuevo espacio deportivo
   * @param espacioDeportivo Datos del espacio deportivo
   */
  crear(espacioDeportivo: Partial<InstalacionEspacioDeportivo>): Observable<ApiResponse<InstalacionEspacioDeportivo>> {
    return this.http.post<ApiResponse<InstalacionEspacioDeportivo>>(`${this.api}`, espacioDeportivo, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponse<InstalacionEspacioDeportivo>> {
    return this.http.delete<ApiResponse<InstalacionEspacioDeportivo>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
