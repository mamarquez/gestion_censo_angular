import { EspacioComplementario } from './espaciocomplementario';

export class InstalacionEspacioComplementario {
  id?: number;
  idInstalacion!: number;
  espacioComplementario!: EspacioComplementario;
  visible: boolean;
  activo: boolean;
}
