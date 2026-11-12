
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EntradasService, Entrada } from '../services/entradas.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: false,
})
export class InicioPage {

  private router = inject(Router);
  private entradas = inject(EntradasService);

  // Última entrada guardada en SQLite
  ultimaEntrada?: Entrada;

  // Se ejecuta cada vez que entramos a Inicio
  async ionViewWillEnter() {
    try {
      this.ultimaEntrada = await this.entradas.ultima();

      console.log(
        'Última entrada guardada en SQLite:',
        this.ultimaEntrada
      );

    } catch (error) {
      console.error('Error al consultar entradas:', error);
    }
  }

  // Abrir configuración desde Inicio
  abrirConfiguracion(): void {
    this.router.navigate(['/tabs/configuracion']);
  }

}
