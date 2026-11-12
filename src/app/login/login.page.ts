import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {

  correo: string = '';
  contrasena: string = '';

  constructor(
    private router: Router,
    private database: DatabaseService
  ) {}

  ngOnInit() {}

  async entrar() {
    try {
      if (!this.correo || !this.contrasena) {
        alert('Por favor completa todos los campos');
        return;
      }

      // Validar credenciales contra SQLite
      const usuario = await this.database.verificarCredenciales(this.correo, this.contrasena);

      if (usuario) {
        // ¡Clave para que tu pantalla de Grabar funcione!
        await Preferences.set({ key: 'usuarioId', value: String(usuario.id) });
        
        console.log('Inicio de sesión exitoso, usuario ID:', usuario.id);
        this.router.navigateByUrl('/tabs/inicio', { replaceUrl: true });
      } else {
        alert('Correo o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      alert('Ocurrió un error al intentar iniciar sesión');
    }
  }

  irRegistro() {
    this.router.navigate(['/registro']);
  }
}