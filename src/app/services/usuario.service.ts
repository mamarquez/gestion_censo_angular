import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioModel } from '../models/usuario-model';
import { AUTH } from '../auth/auth.constants';
import { ApiResponseWrapper } from '../interface/api-response-wrapper.interface';
import { buildHttpParams } from '../utils/params.util';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly http = inject(HttpClient);
  private readonly api = `${AUTH.API}/usuarios`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  /**
   * Obtener provincias
   */
  getAll(filtros?: any): Observable<ApiResponseWrapper<UsuarioModel[]>> {
    return this.http.get<ApiResponseWrapper<UsuarioModel[]>>(`${this.api}`, {
      params: buildHttpParams(filtros),
      headers: this.headers
    });
  }

  /**
   * Devuelve el registro
   * @param id Id del registro
   */
  get(id: string) {
    return this.http.get<ApiResponseWrapper<UsuarioModel>>(`${this.api}/${id}`, {
      headers: this.headers
    });
  }

  /**
   * Crea un nuevo usuario
   * @param usuario Datos del nuevo usuario
   */
  add(usuario: Partial<UsuarioModel>): Observable<ApiResponseWrapper<UsuarioModel>> {
    return this.http.post<ApiResponseWrapper<UsuarioModel>>(`${this.api}`, usuario, { headers: this.headers });
  }

  /**
   * Actualiza los datos de un usuario
   * @param id Id del registro
   * @param usuario Datos a actualizar
   */
  update(id: string, usuario: Partial<UsuarioModel>): Observable<ApiResponseWrapper<UsuarioModel>> {
    return this.http.put<ApiResponseWrapper<UsuarioModel>>(`${this.api}/${id}`, usuario, { headers: this.headers });
  }

  /**
   * Cambia el estado de un registro
   * @param id Id del registro
   */
  cambiarEstado(id: string): Observable<ApiResponseWrapper<UsuarioModel>> {
    return this.http.patch<ApiResponseWrapper<UsuarioModel>>(`${this.api}/${id}`, null, { headers: this.headers });
  }

  /**
   * Borra un registro
   * @param id Id del registro
   */
  borrarRegistro(id: string): Observable<ApiResponseWrapper<UsuarioModel>> {
    return this.http.delete<ApiResponseWrapper<UsuarioModel>>(`${this.api}/${id}`, { headers: this.headers });
  }
}
