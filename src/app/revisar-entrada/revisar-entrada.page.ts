import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { EntradasService } from '../services/entradas.service';

@Component({
  selector: 'app-revisar-entrada',
  templateUrl: './revisar-entrada.page.html',
  styleUrls: ['./revisar-entrada.page.scss'],
  standalone: false,
})
export class RevisarEntradaPage implements OnInit {

  fechaActual: Date = new Date();

  duracion: string = '00:00:00';

  transcripcion: string = '';

  etiquetas: string = '';

  constructor(
    private router: Router,
    private entradas: EntradasService,
    private toast: ToastController
  ) { }


  ngOnInit() {
    // La recepción de datos se realiza al entrar a la página.
  }


  ionViewWillEnter() {
    // Recuperar los datos enviados desde Grabar
    const datos =
      this.router.getCurrentNavigation()?.extras.state ??
      history.state;

    // Comprobar qué información llega
    console.log('Datos recibidos en Revisar entrada:', datos);

    if (typeof datos.transcripcion === 'string') {
      this.transcripcion = datos.transcripcion;
    }

    if (typeof datos.duracion === 'number') {
      const segundos = datos.duracion;

      const horas = Math.floor(segundos / 3600);
      const minutos = Math.floor((segundos % 3600) / 60);
      const seg = segundos % 60;

      this.duracion = [horas, minutos, seg]
        .map(valor => String(valor).padStart(2, '0'))
        .join(':');
    }
  }

  guardando = false;

  async guardarEntrada() {
    if (this.guardando) return;

    const texto = this.transcripcion.trim();

    if (!texto) {
      await this.mostrarMensaje(
        'Escribe una transcripción antes de guardar.',
        'warning'
      );
      return;
    }

    const partes = this.duracion.split(':').map(Number);

    const duracionSegundos =
      partes[0] * 3600 +
      partes[1] * 60 +
      partes[2];

    this.guardando = true;

    try {
      await this.entradas.guardar({
        texto,
        duracion: duracionSegundos
      });

      await this.mostrarMensaje(
        '¡Entrada guardada correctamente!',
        'success'
      );

      await this.router.navigateByUrl('/tabs/inicio', {
        replaceUrl: true
      });

    } catch (error) {
      console.error('Error al guardar entrada:', error);

      await this.mostrarMensaje(
        'No se pudo guardar la entrada.',
        'danger'
      );

    } finally {
      this.guardando = false;
    }
  }


  async descartarEntrada() {
    // Limpiar los datos de la entrada
    this.transcripcion = '';
    this.duracion = '00:00:00';
    this.etiquetas = '';

    // Regresar a la pantalla Grabar sin guardar
    await this.router.navigateByUrl('/tabs/grabar', {
      replaceUrl: true
    });
  }


  private async mostrarMensaje(
    mensaje: string,
    color: string
  ) {
    const aviso = await this.toast.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color
    });

    await aviso.present();
  }

}
