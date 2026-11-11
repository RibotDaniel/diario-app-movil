
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
  standalone: false,
})
export class ConfiguracionPage {

  private router = inject(Router);
  private alertController = inject(AlertController);

  nombre = 'Usuario';
  correo = '';

  async editarPerfil() {
    const alerta = await this.alertController.create({
      header: 'Editar perfil',
      message: 'Próximamente podrás editar tu perfil.',
      buttons: ['Aceptar']
    });

    await alerta.present();
  }

  async cambiarContrasena() {
    const alerta = await this.alertController.create({
      header: 'Cambiar contraseña',
      message: 'Próximamente podrás cambiar tu contraseña.',
      buttons: ['Aceptar']
    });

    await alerta.present();
  }

  cerrarSesion() {
    this.router.navigate(['/login']);
  }

}