export class Auditoria {
  id!: number;
  tabla!: string;
  registroId!: number;
  operacion!: string;
  usuarioId!: number;
  fecha!: Date;
  valor_anterior!: JSON;
  valor_nuevo!: JSON;

  // Configuración de validaciones
  static campos = {
    tabla: { maxLength: 50 },
    operacion: { maxLength: 10 }
  };
}
