import { MessageService } from 'primeng/api';

/**
 * @version 1.0.0
 * @param messageService
 * @param tipo
 * @param mensaje
 */

export function mensajesUtil(
  messageService: MessageService,
  tipo: string,
  mensaje: string
) {

  const texto: Record<string, string> = {
    'add': 'Registro creado correctamente',
    'update': 'Registro actualizado correctamente',
    'delete': 'Registro borrado correctamente',
    'error': 'No se ha podido realizar la operación',
    'cargas': 'No se han podido obtener los registros',
    'carga': 'No se ha podido obtener el registro',
    'formato': 'Formato de imagen no soportado. Usa PNG, JPG, GIF o BMP'
  };

  switch (tipo) {
    case 'success': {
      messageService.add({
        severity: 'success',
        summary: 'Actualizado',
        detail: texto[mensaje] ?? 'Operación realizada correctamente'
      });
      break;
    }
    case 'error': {
      messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: texto[mensaje] ?? 'No se ha podido realizar operación'
      });
      break;
    }
  }

}
