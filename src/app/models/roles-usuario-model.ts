import { Rol } from './rol';

export interface RolesUsuarioModel {
  id?: number;
  idUsuario: number;
  idRol: number;
  roles: Rol[];
}
