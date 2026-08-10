import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { InstalacionTelefono } from '../models/instalaciontelefono';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';

@Injectable({
  providedIn: 'root'
})
export class InstalacionTelefonoService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/instalacionestelefonos`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener todos los teléfonos de instalaciones
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<InstalacionTelefono[]>> {
    return this.http.get<ApiResponseWrapper<InstalacionTelefono[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtener teléfonos de una instalación
   */
  get(id?: any): Observable<ApiResponseWrapper<InstalacionTelefono>> {
    return this.http.get<ApiResponseWrapper<InstalacionTelefono>>(`${this.api}/${id}`, {
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<InstalacionTelefono>> {
    return this.http.patch<ApiResponseWrapper<InstalacionTelefono>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Crea un nuevo teléfono
   * @param telefono Datos del teléfono
   */
  crear(telefono: Partial<InstalacionTelefono>): Observable<ApiResponseWrapper<InstalacionTelefono>> {
    return this.http.post<ApiResponseWrapper<InstalacionTelefono>>(`${this.api}`, telefono, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<InstalacionTelefono>> {
    return this.http.delete<ApiResponseWrapper<InstalacionTelefono>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
