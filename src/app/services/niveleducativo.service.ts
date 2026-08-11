import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';
import { NivelEducativo } from '../models/niveleducativo';

/**
 * @version 1.0.0
 */

@Injectable({
  providedIn: 'root'
})
export class NivelEducativoService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/niveleseducativos`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener todos los niveles educativos
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<NivelEducativo[]>> {
    return this.http.get<ApiResponseWrapper<NivelEducativo[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtener nivel educativo
   */
  get(id: string): Observable<ApiResponseWrapper<NivelEducativo>> {
    return this.http.get<ApiResponseWrapper<NivelEducativo>>(`${this.api}/${id}`, { headers: this.headers });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<boolean>> {
    return this.http.patch<ApiResponseWrapper<boolean>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Añade el registro
   * @param datos
   */
  addRegistro(datos: NivelEducativo): Observable<ApiResponseWrapper<boolean>> {
    return this.http.post<ApiResponseWrapper<boolean>>(`${this.api}`, datos, { headers: this.headers });
  }

  /**
   * Actualiza el registro
   * @param datos
   */
  updateRegistro(datos: NivelEducativo): Observable<ApiResponseWrapper<boolean>> {
    return this.http.put<ApiResponseWrapper<boolean>>(`${this.api}/${datos.id}`, datos, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<NivelEducativo>> {
    return this.http.delete<ApiResponseWrapper<NivelEducativo>>(`${this.api}/${id}`, { headers: this.headers });
  }

}
