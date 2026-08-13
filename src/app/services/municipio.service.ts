import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Municipio } from '../models/municipio';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';


@Injectable({
  providedIn: 'root'
})
export class MunicipioService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/municipios`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener municipios
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<Municipio[]>> {
    return this.http.get<ApiResponseWrapper<Municipio[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtiene el registro
   * @param id Id del registro
   */
  get(id: String): Observable<ApiResponseWrapper<Municipio>> {
    return this.http.get<ApiResponseWrapper<Municipio>>(`${this.api}/${id}`, {
      headers: this.headers
    });
  }

  /**
   * Añadir registro
   */
  addRegistro(datos: Municipio): Observable<ApiResponseWrapper<boolean>> {
    return this.http.post<ApiResponseWrapper<boolean>>(`${this.api}`, datos, { headers: this.headers });
  }

  /**
   * Actualizar registro
   */
  updateRegistro(datos: Municipio): Observable<ApiResponseWrapper<boolean>> {
    return this.http.put<ApiResponseWrapper<boolean>>(`${this.api}/${datos.id}`, datos, { headers: this.headers });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<Municipio>> {
    return this.http.patch<ApiResponseWrapper<Municipio>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<boolean>> {
    return this.http.delete<ApiResponseWrapper<boolean>>(`${this.api}/${id}`, { headers: this.headers });
  }

}
