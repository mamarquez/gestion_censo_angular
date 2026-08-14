import { Rol } from './rol';
import { TipoRolModel } from './tipo-rol-model';

export class RolPermisoModel {
  id!: number;
  rol!: Rol;
  tipoRol!: TipoRolModel;

}
