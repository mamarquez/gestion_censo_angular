import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';
import { InstalacionCaracteristica } from '../models/instalacionCaracteristica';

@Injectable({
  providedIn: 'root'
})
export class InstalacionCaracteristicaService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/instalacionescaracteristicas`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener todos los registros
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<InstalacionCaracteristica[]>> {

    console.log(filtros);

    return this.http.get<ApiResponseWrapper<InstalacionCaracteristica[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtener registro
   */
  get(id?: any): Observable<ApiResponseWrapper<InstalacionCaracteristica[]>> {
    return this.http.get<ApiResponseWrapper<InstalacionCaracteristica[]>>(`${this.api}/${id}`, {
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<boolean>> {
    return this.http.patch<ApiResponseWrapper<boolean>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Cambia la visibilidad de un registro
   * @param id Id del registro
   */
  cambiarVisible(id: number): Observable<ApiResponseWrapper<boolean>> {
    return this.http.patch<ApiResponseWrapper<boolean>>(`${this.api}/visibilidad/${id}`, null, { headers: this.headers });
  }

  /**
   * Crea una nueva característica de instalación
   * @param caracteristica Datos de la característica
   */
  crear(caracteristica: InstalacionCaracteristica): Observable<ApiResponseWrapper<boolean>> {
    return this.http.post<ApiResponseWrapper<boolean>>(`${this.api}`, caracteristica, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<boolean>> {
    return this.http.delete<ApiResponseWrapper<boolean>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
