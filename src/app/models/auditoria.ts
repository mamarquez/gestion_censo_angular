import { UsuarioModel } from './usuario-model';

export class Auditoria {
  id!: number;
  tabla!: string;
  registroId!: number;
  operacion!: string;
  usuario!: UsuarioModel;
  fecha!: Date;
  valorAnterior!: JSON;
  valorNuevo!: JSON;
  cambios!: string;

  // Configuración de validaciones
  public static readonly campos = {
    tabla: { maxLength: 50 },
    operacion: { maxLength: 10 }
  };
}
