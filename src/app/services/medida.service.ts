import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medida } from '../models/medida';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';

@Injectable({
  providedIn: 'root'
})
export class MedidaService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/medidas`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener medidas
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<Medida[]>> {
    return this.http.get<ApiResponseWrapper<Medida[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtener registro
   * @param id Id del registro
   */
  get(id: string): Observable<ApiResponseWrapper<Medida>> {
    return this.http.get<ApiResponseWrapper<Medida>>(`${this.api}/${id}`, {
      headers: this.headers
    });
  }

  /**
   * Añadir registro
   */
  addRegistro(datos: Medida): Observable<ApiResponseWrapper<boolean>> {
    return this.http.post<ApiResponseWrapper<boolean>>(`${this.api}`, datos, { headers: this.headers });
  }

  /**
   * Actualizar registro
   */
  updateRegistro(datos: Medida): Observable<ApiResponseWrapper<boolean>> {
    return this.http.put<ApiResponseWrapper<boolean>>(`${this.api}/${datos.id}`, datos, { headers: this.headers });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<Medida>> {
    return this.http.patch<ApiResponseWrapper<Medida>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<Medida>> {
    return this.http.delete<ApiResponseWrapper<Medida>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
