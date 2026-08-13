import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH } from '../auth/auth.constants';
import { Provincia } from '../models/provincia';
import { buildHttpParams } from '../utils/params.util';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';



@Injectable({
  providedIn: 'root'
})
export class ProvinciaService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/provincias`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener provincias
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<Provincia[]>> {
    return this.http.get<ApiResponseWrapper<Provincia[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtiene el registro
   * @param id Id del registro
   */
  get(id: String): Observable<ApiResponseWrapper<Provincia>> {
    return this.http.get<ApiResponseWrapper<Provincia>>(`${this.api}/${id}`, {
      headers: this.headers
    });
  }

  /**
   * Añadir registro
   */
  addRegistro(datos: Provincia): Observable<ApiResponseWrapper<boolean>> {
    return this.http.post<ApiResponseWrapper<boolean>>(`${this.api}`, datos, { headers: this.headers });
  }

  /**
   * Actualizar registro
   */
  updateRegistro(datos: Provincia): Observable<ApiResponseWrapper<boolean>> {
    return this.http.put<ApiResponseWrapper<boolean>>(`${this.api}/${datos.id}`, datos, { headers: this.headers });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<Provincia>> {
    return this.http.patch<ApiResponseWrapper<Provincia>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<Provincia>> {
    return this.http.delete<ApiResponseWrapper<Provincia>>(`${this.api}/${id}`, { headers: this.headers });
  }

}
