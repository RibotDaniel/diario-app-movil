import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-cambiar-contrasena',
  templateUrl: './cambiar-contrasena.page.html',
  styleUrls: ['./cambiar-contrasena.page.scss'],
})
export class CambiarContrasenaPage {

  passwordActual: string = '';
  passwordNueva: string = '';
  passwordConfirmar: string = '';

  constructor(private toastController: ToastController) {}

  async guardarContrasena() {
    if (this.passwordNueva !== this.passwordConfirmar) {
      const toast = await this.toastController.create({
        message: 'Las contraseñas nuevas no coinciden',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
      return;
    }

    const toast = await this.toastController.create({
      message: 'Contraseña actualizada correctamente',
      duration: 2000,
      color: 'success'
    });
    toast.present();
  }
}