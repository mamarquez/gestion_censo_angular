import { inject, Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

export interface ConfirmDialogConfig {
  mensaje: string;
  titulo?: string;
  labelAceptar?: string;
  labelCancelar?: string;
  esPeligroso?: boolean;
  onAccept: () => void;
  onReject?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private readonly confirmationService = inject(ConfirmationService);

  confirmar(config: ConfirmDialogConfig): void {
    this.confirmationService.confirm({
      message: config.mensaje,
      header: config.titulo || 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: config.labelAceptar || 'Aceptar',
      rejectLabel: config.labelCancelar || 'Cancelar',
      acceptButtonStyleClass: config.esPeligroso !== false
        ? 'p-button-danger p-button-sm'
        : 'p-button-primary p-button-sm',
      rejectButtonStyleClass: 'p-button-outlined p-button-secondary p-button-sm',
      accept: () => config.onAccept(),
      reject: () => config.onReject && config.onReject()
    });
  }
}
