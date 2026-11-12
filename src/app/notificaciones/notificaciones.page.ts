import { Component, signal } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
  standalone: false,
})
export class NotificacionesPage {

  activas = signal(false);

  async ionViewWillEnter() {
    const { notifications } = await LocalNotifications.getPending();
    this.activas.set(notifications.length > 0);
  }

  async activar() {
    await LocalNotifications.requestPermissions();
    await LocalNotifications.schedule({
      notifications: [{
        id: 1,
        title: 'Tu diario te espera 📔',
        body: 'Tómate un momento para escribir cómo te fue hoy.',
        schedule: { on: { hour: 20, minute: 0 } },
      }],
    });
    this.activas.set(true);
  }

  async apagar() {
    await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
    this.activas.set(false);
  }

}