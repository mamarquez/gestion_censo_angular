import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';

@Injectable({
  providedIn: 'root'
})
export class UsuarioRolService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/usuarios-roles`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Asigna una lista de roles a un usuario, reemplazando las asignaciones previas
   * @param usuarioId Id del usuario
   * @param rolesIds Ids de los roles a asignar
   */
  asignarRoles(usuarioId: number, rolesIds: number[]): Observable<ApiResponseWrapper<boolean>> {
    return this.http.post<ApiResponseWrapper<boolean>>(`${this.api}`, {
      usuarioId,
      rolesIds
    }, { headers: this.headers });
  }
}
