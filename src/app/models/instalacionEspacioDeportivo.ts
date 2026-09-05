import { Instalacion } from './instalacion';
import { TipoInstalacion } from './tipo-instalacion';

export class InstalacionEspacioDeportivo {
  id?: number;
  instalacion!: Instalacion;
  tipoInstalacion?: TipoInstalacion;
  nombre!: string;
  descripcion?: string;
  visible!: boolean;
}
