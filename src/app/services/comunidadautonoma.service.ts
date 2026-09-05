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
  get(id: string): Observable<ApiResponseWrapper<ComunidadAutonoma>> {
    return this.http.get<ApiResponseWrapper<ComunidadAutonoma>>(`${this.api}/${id}`, {
      headers: this.headers
    });
  }

  /**
   * Añadir registro
   */
  addRegistro(datos: ComunidadAutonoma): Observable<ApiResponseWrapper<boolean>> {
    return this.http.post<ApiResponseWrapper<boolean>>(`${this.api}`, datos, { headers: this.headers });
  }

  /**
   * Actualizar registro
   */
  updateRegistro(datos: ComunidadAutonoma): Observable<ApiResponseWrapper<boolean>> {
    return this.http.put<ApiResponseWrapper<boolean>>(`${this.api}/${datos.id}`, datos, { headers: this.headers });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<ComunidadAutonoma>> {
    return this.http.patch<ApiResponseWrapper<ComunidadAutonoma>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<ComunidadAutonoma>> {
    return this.http.delete<ApiResponseWrapper<ComunidadAutonoma>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
