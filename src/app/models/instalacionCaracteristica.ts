import { Medida } from './medida';
import { Caracteristica } from './caracteristica';

export class InstalacionCaracteristica {
  id?: number;
  idInstalacion?: number | null;
  idEspacioDeportivo?: number | null;
  caracteristica!: Caracteristica;
  medida!: Medida;
  valor: number;
  visible: boolean;
}
