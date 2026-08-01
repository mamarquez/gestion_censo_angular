import { Rol } from './rol';

export interface Usuario {
  id?: string;
  username: string;
  password?: string;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  descripcion?: string;
  activo: boolean;
  email: string;
  ultimo_acceso?: Date;
  roles: Rol[];
}
