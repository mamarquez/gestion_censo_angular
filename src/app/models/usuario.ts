export class Usuario {
  id!: number;
  usuario!: string;
  password!: string;
  nombre!: string;
  apellido1!: string;
  apellido2!: string;
  descripcion?: string;
  activo!: boolean;
  email!: string;
  token?: string;
  ultimo_acceso?: Date;
}
