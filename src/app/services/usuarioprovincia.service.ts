import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { UsuarioProvinciaModel } from '../models/usuario-provincia-model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioProvinciaService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/usuarios-provincias`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtiene las provincias asignadas a un usuario
   * @param usuarioId Id del usuario
   */
  getByUsuario(usuarioId: number): Observable<ApiResponseWrapper<UsuarioProvinciaModel[]>> {
    return this.http.get<ApiResponseWrapper<UsuarioProvinciaModel[]>>(`${this.api}/usuario/${usuarioId}`, { headers: this.headers });
  }

  /**
   * Asigna una lista de provincias a un usuario, reemplazando las asignaciones previas
   * @param usuarioId Id del usuario
   * @param provinciaIds Ids de las provincias a asignar
   */
  asignarProvincias(usuarioId: number, provinciaIds: number[]): Observable<ApiResponseWrapper<boolean>> {
    return this.http.post<ApiResponseWrapper<boolean>>(`${this.api}`, {
      usuarioId,
      provinciaIds
    }, { headers: this.headers });
  }
}
