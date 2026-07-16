import { Component, ChangeDetectorRef, inject } from '@angular/core'; // 1. Añadido ChangeDetectorRef e inject
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { firstValueFrom } from 'rxjs';

import {
  AuthAlertComponent,
  AuthButtonComponent,
  AuthCardComponent,
  AuthInputComponent
} from '../shared';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AuthCardComponent,
    AuthInputComponent,
    AuthButtonComponent,
    AuthAlertComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  // 2. Inyección moderna del detector de cambios
  private cdr = inject(ChangeDetectorRef);

  loading = false;
  loginError = false;
  errorMessage = '';
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      accessType: [0, Validators.required],
      rememberMe: [false]
    });
  }

  //=================================================
  // GETTERS
  //=================================================
  get username() { return this.loginForm.controls['username']; }
  get password() { return this.loginForm.controls['password']; }
  get accessType() { return this.loginForm.controls['accessType']; }
  get rememberMe() { return this.loginForm.controls['rememberMe']; }

  //=================================================
  // MENSAJES DE ERROR
  //=================================================
  get usernameError(): string {
    if (this.username.touched && this.username.hasError('required')) {
      return 'El usuario es obligatorio.';
    }
    return '';
  }

  get passwordError(): string {
    if (this.password.touched && this.password.hasError('required')) {
      return 'La contraseña es obligatoria.';
    }
    return '';
  }

  //=================================================
  // LOGIN CONTROLADO Y SECUENCIAL
  //=================================================
  async onSubmit(): Promise<void> {
    this.loginError = false;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const credentials = this.loginForm.getRawValue();
    this.loading = true;
    this.loginForm.disable(); // 3. Congela la pantalla por completo

    try {
      const response = await firstValueFrom(this.authService.login(credentials));

      console.log('Login correcto', response);

      // Guardar sesión utilizando tu servicio estructurado
      this.authService.saveSession(response);

      // Restablecer estados de carga previos a la navegación
      this.loading = false;
      this.loginForm.enable();

      // Navegar a la raíz del aplicativo
      await this.router.navigate(['/']);

    } catch (error: any) {
      console.error('Error en el login:', error);

      // --- FLUJO DE FALLO ---
      this.loading = false;
      this.loginForm.enable(); // 4. Descongelamos el formulario para permitir cambios

      // 5. Forzamos el vaciado inmediato de los campos de texto
      this.loginForm.get('username')?.setValue('');
      this.loginForm.get('password')?.setValue('');
      
      // 6. Reseteamos el formulario preservando los tipos de acceso
      this.loginForm.reset({
        username: '',
        password: '',
        accessType: 0,
        rememberMe: false
      });

      // 7. Pintamos el mensaje de error del backend o el genérico
      this.loginError = true;
      this.errorMessage = error?.error?.message ?? 'Usuario o contraseña incorrectos.';
      this.cdr.markForCheck(); // Fuerza el redibujado para mostrar el alert

      // 8. Enfoque secuencial nativo: Espera 3 segundos exactos en este hilo
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 9. Limpieza automática tras cumplirse el tiempo
      this.loginError = false;
      this.errorMessage = '';
      this.cdr.markForCheck(); // Fuerza el redibujado para ocultar el alert
    }
  }
}
