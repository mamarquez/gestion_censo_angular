import { ChangeDetectorRef, Component, DestroyRef, inject, input, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsuarioService } from '../../../services/usuario.service';
import { UsuarioModel } from '../../../models/usuario-model';
import { ApiResponseWrapper } from '../../../interface/api-response-wrapper.interface';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Fieldset } from 'primeng/fieldset';
import { Fluid } from 'primeng/fluid';
import { InputText } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { mensajesUtil } from '../../../utils/mensajes.util';
import { Router } from '@angular/router';
import { ChipModule } from 'primeng/chip';
import { AUTH } from '../../../auth/auth.constants';

/**
 * @version 1.0.1
 */

@Component({
  standalone: true,
  selector: 'app-perfil',
  imports: [
    Button,
    Fieldset,
    Fluid,
    FormsModule,
    InputText,
    ReactiveFormsModule,
    ToastModule,
    ChipModule
  ],
  providers: [MessageService],
  templateUrl: './perfil.component.html'
})
export class PerfilComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly usuarioService = inject(UsuarioService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  id = input<string>();
  cargando = false;
  guardando = false;
  private usuarioId: string | null = null;

  get avatarUrl(): string {
    const avatar = this.form.get('avatar')?.value;
    
    if (!avatar) {
      return '/images/no_image_user.png';
    }

    if (avatar.startsWith('http')) {
      return avatar;
    }

    return `${AUTH.API}/usuarios/uploads/${avatar}`;
  }

  form = this.fb.group({
    id: [null],
    nombreUsuario: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]],
    nombre: ['', [Validators.required]],
    apellido1: [null],
    apellido2: [null],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    descripcion: [null],
    activo: [true],
    avatar: [null],
    roles: [null]
  });

  constructor() {
    effect(() => {
      // const userId = this.id();
      const userId = 1;
      if (userId) {
        this.cargarPerfil(String(userId));
      }
    });
  }

  private cargarPerfil(id: string) {
    this.cargando = true;

    this.usuarioService.get(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: ApiResponseWrapper<UsuarioModel>) => {
          const usuario = response.data ?? null;

          if (usuario) {
            this.usuarioId = String(usuario.id);
            this.form.patchValue({
              id: usuario.id,
              nombreUsuario: usuario.nombreUsuario,
              nombre: usuario.nombre,
              apellido1: usuario.apellido1,
              apellido2: usuario.apellido2 ?? '',
              email: usuario.email,
              descripcion: usuario.descripcion ?? '',
              activo: usuario.activo,
              avatar: usuario.avatar ?? null,
              roles: usuario.roles ?? null
            });

            this.cdr.detectChanges();
          }

          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar perfil:', err);
          mensajesUtil(this.messageService, 'error', 'carga');
          this.cargando = false;
        }
      });
  }

  guardar(): void {
    if (this.form.invalid || !this.usuarioId) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;

    const datos = { ...this.form.value };

    for (const campo in datos) {
      if (typeof datos[campo] === 'string' && !datos[campo].trim()) {
        datos[campo] = null;
      }
    }

    this.usuarioService.updatePerfil(Number(this.usuarioId), datos)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          mensajesUtil(this.messageService, 'success', 'update');
          this.guardando = false;
        },
        error: (err) => {
          console.error('Error al guardar perfil', err);
          mensajesUtil(this.messageService, 'error', 'error');
          this.guardando = false;
        }
      });
  }

  cancelar(): void {
    this.router.navigate(['/instalaciones']);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      // 1. Cuando termine de leer el archivo, guarda el Base64 en el formulario
      reader.onload = () => {
        this.form.patchValue({
          avatar: reader.result as string // Guarda un texto como: "data:image/png;base64,iVBORw0..."
        });
      };

      reader.readAsDataURL(file);
    }
  }

}
