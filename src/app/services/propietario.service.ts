import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';
import { Propietario } from '../models/propietario';

@Injectable({
  providedIn: 'root'
})
export class PropietarioService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/propietarios`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener gestores
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<Propietario[]>> {
    return this.http.get<ApiResponseWrapper<Propietario[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<Propietario>> {
    return this.http.patch<ApiResponseWrapper<Propietario>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<Propietario>> {
    return this.http.delete<ApiResponseWrapper<Propietario>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
