import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Usuario } from '../models/usuario';
import { AUTH } from '../auth/auth.constants';
import { ApiResponse } from '../models/apiresponse';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  
  private readonly http = inject(HttpClient);  
  private readonly api = `${AUTH.API}/usuarios`;


   /**
   * Obtener todos las usuario
   */
  getAll(): Observable<ApiResponse<Usuario[]>> {
    return this.http.get<ApiResponse<Usuario[]>>(this.api);
  }
}