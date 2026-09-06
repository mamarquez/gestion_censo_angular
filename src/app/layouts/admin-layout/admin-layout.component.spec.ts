import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout.component';
import { AuthService } from '../../auth/services/auth.service';

describe('AdminLayoutComponent', () => {
  let component: AdminLayoutComponent;
  let fixture: ComponentFixture<AdminLayoutComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUser', 'logout']);
    authServiceSpy.getUser.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [AdminLayoutComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLayoutComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('inicializa usuarioLogueado con el usuario del AuthService', () => {
    fixture.detectChanges();
    expect(authServiceSpy.getUser).toHaveBeenCalled();
    expect(component.usuarioLogueado()).toBeNull();
  });

  it('sidebarAbierto empieza cerrado', () => {
    fixture.detectChanges();
    expect(component.sidebarAbierto()).toBeFalse();
  });

  it('toggleSidebar() alterna el estado del sidebar', () => {
    fixture.detectChanges();

    component.toggleSidebar();
    expect(component.sidebarAbierto()).toBeTrue();

    component.toggleSidebar();
    expect(component.sidebarAbierto()).toBeFalse();
  });

  it('cerrarSidebar() cierra el sidebar', () => {
    fixture.detectChanges();

    component.toggleSidebar();
    expect(component.sidebarAbierto()).toBeTrue();

    component.cerrarSidebar();
    expect(component.sidebarAbierto()).toBeFalse();
  });

  it('onLogout() delega en AuthService.logout()', () => {
    fixture.detectChanges();

    component.onLogout();

    expect(authServiceSpy.logout).toHaveBeenCalled();
  });
});
