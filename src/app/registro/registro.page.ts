import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false,
})
export class RegistroPage {

  nombre: string = '';
  correo: string = '';
  contrasena: string = '';

  constructor(
    private router: Router,
    private database: DatabaseService
  ) {}

  async registrar() {
    try {
      if (!this.nombre || !this.correo || !this.contrasena) {
        alert('Por favor completa todos los campos');
        return;
      }

      // 1. Guardar usuario en la base de datos SQLite (con el hash seguro de tu compañero)
      await this.database.registrarUsuario(this.nombre, this.correo, this.contrasena);

      // 2. Consultar el ID del usuario recién creado para dejarlo con sesión activa
      // (Para que al ir a Grabar no falle la llave foránea)
      await this.database.inicializar();
      // Nota: Opcionalmente podemos hacer un SELECT rápido o asignar el ID tras el registro exitoso.
      
      alert('¡Cuenta creada con éxito!');

      // 3. Redirigir al login o directo a inicio según prefieras
      this.router.navigateByUrl('/login', { replaceUrl: true });

    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
      alert(error.message || 'Ocurrió un error al registrar la cuenta');
    }
  }

}