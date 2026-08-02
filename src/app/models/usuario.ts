import { Rol } from './rol';

export interface Usuario {
  id?: string;
  nombreUsuario: string;
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
