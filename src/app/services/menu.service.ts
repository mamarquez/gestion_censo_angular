import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Menu } from '../models/menu';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';
import { ApiResponseWrapper } from './provincia.service';
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
  getAll(filtros?: any): Observable<ApiResponse<Menu[]>> {
    const params = buildHttpParams(filtros);

    return this.http.get<ApiResponseWrapper<Menu[]>>(`${this.api}`, { params, headers: this.headers });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: number): Observable<ApiResponse<Menu>> {
    return this.http.patch<ApiResponse<Menu>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: number): Observable<ApiResponse<Menu>> {
    return this.http.delete<ApiResponse<Menu>>(`${this.api}/${id}`, { headers: this.headers });
  }

}
