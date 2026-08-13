import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Menu } from '../models/menu';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/menus`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener menús
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<Menu[]>> {
    return this.http.get<ApiResponseWrapper<Menu[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Obtener nivel educativo
   */
  get(id: string): Observable<ApiResponseWrapper<Menu>> {
    return this.http.get<ApiResponseWrapper<Menu>>(`${this.api}/${id}`, { headers: this.headers });
  }

  /**
   * Añade el registro
   * @param datos
   */
  addRegistro(datos: Menu): Observable<ApiResponseWrapper<boolean>> {
    return this.http.post<ApiResponseWrapper<boolean>>(`${this.api}`, datos, { headers: this.headers });
  }

  /**
   * Actualiza el registro
   * @param datos
   */
  updateRegistro(datos: Menu): Observable<ApiResponseWrapper<boolean>> {
    return this.http.put<ApiResponseWrapper<boolean>>(`${this.api}/${datos.id}`, datos, { headers: this.headers });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponseWrapper<Menu>> {
    return this.http.patch<ApiResponseWrapper<Menu>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponseWrapper<Menu>> {
    return this.http.delete<ApiResponseWrapper<Menu>>(`${this.api}/${id}`, { headers: this.headers });
  }

}
