import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: false,
})
export class InicioPage {

  private router = inject(Router);

  // Abrir configuración desde el botón de Inicio
  abrirConfiguracion(): void {
    this.router.navigate(['/tabs/configuracion']);
  }

}