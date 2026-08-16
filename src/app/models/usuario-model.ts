import { Rol } from './rol';

export interface UsuarioModel {
  id?: string;
  nombreUsuario: string;
  password?: string | null;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  descripcion?: string;
  activo: boolean;
  email: string;
  avatar?: string | null;
  ultimo_acceso?: Date;
  roles: Rol[];
}
