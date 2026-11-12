import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonItem, IonLabel, IonInput, IonButton, IonIcon } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.page.html',
  styleUrls: ['./editar-perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonItem, 
    IonLabel, 
    IonInput, 
    IonButton, 
    IonIcon
  ]
})
export class EditarPerfilPage {

  nombreUsuario: string = '';
  imagenPerfil: string | undefined = undefined;

  constructor(private toastController: ToastController) {}

  // Función para abrir la cámara de Capacitor
  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      this.imagenPerfil = image.dataUrl;
    } catch (error) {
      console.log('Permiso denegado o cancelación de cámara', error);
    }
  }

  // Notificación de éxito al confirmar
  async guardarCambios() {
    const toast = await this.toastController.create({
      message: `Perfil actualizado correctamente`,
      duration: 2000,
      color: 'success'
    });
    toast.present();
  }
}