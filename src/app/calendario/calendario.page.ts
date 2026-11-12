import { Component, OnInit } from '@angular/core';
import { addIcons } from 'ionicons';
import {
  calendar,
  calendarOutline,
  homeOutline,
  statsChartOutline,
  micOutline,
  notificationsOutline,
  personCircleOutline,
  settingsOutline,
  pricetagOutline,
} from 'ionicons/icons';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
  standalone: false,
})
export class CalendarioPage implements OnInit {

  // Almacena la fecha seleccionada en formato string ISO para el ion-datetime
  fechaSeleccionada: string = new Date().toISOString();

  // Arreglo para almacenar las entradas del día consultadas de SQLite
  entradasDelDia: any[] = [];

  constructor(private database: DatabaseService) {
    addIcons({
      calendar,
      calendarOutline,
      homeOutline,
      statsChartOutline,
      micOutline,
      notificationsOutline,
      personCircleOutline,
      settingsOutline,
      pricetagOutline,
    });
  }

  ngOnInit() {
    this.cargarEntradasPorFecha(this.fechaSeleccionada);
  }

  // Método que se ejecuta al cambiar la fecha en el calendario nativo
  async onFechaCambiada(event: any) {
    this.fechaSeleccionada = event.detail.value;
    console.log('Fecha seleccionada:', this.fechaSeleccionada);
    
    await this.cargarEntradasPorFecha(this.fechaSeleccionada);
  }

  async cargarEntradasPorFecha(fechaIso: string) {
    try {
      const fechaFormateada = fechaIso.split('T')[0];
      
      // Nota: Asegúrate de pasar el ID del usuario con sesión activa (por ahora usamos 1 de prueba)
      const usuarioId = 1; 

      this.entradasDelDia = await this.database.obtenerTranscripcionesPorFecha(usuarioId, fechaFormateada);
      
      console.log('Registros encontrados para la fecha:', this.entradasDelDia);
    } catch (error) {
      console.error('Error al cargar entradas del calendario:', error);
    }
  }

}