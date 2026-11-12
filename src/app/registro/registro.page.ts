import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
    console.log('Botón presionado. Datos actuales:', {
      nombre: this.nombre,
      correo: this.correo,
      contrasena: this.contrasena
    });

    try {
      if (!this.nombre || !this.correo || !this.contrasena) {
        alert('Por favor completa todos los campos');
        return;
      }

      await this.database.registrarUsuario(this.nombre, this.correo, this.contrasena);
      
      alert('¡Cuenta creada con éxito!');
      this.router.navigateByUrl('/login', { replaceUrl: true });

    } catch (error: any) {
      console.error('Error detallado al registrar usuario:', error);
      alert(error.message || 'Ocurrió un error al registrar la cuenta');
    }
  }

}