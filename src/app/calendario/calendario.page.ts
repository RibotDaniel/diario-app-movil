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

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
  standalone: false,
})
export class CalendarioPage implements OnInit {

  // Almacena la fecha seleccionada en formato string ISO para el ion-datetime
  fechaSeleccionada: string = new Date().toISOString();

  constructor() {
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

  ngOnInit() {}

  // Método que se ejecuta al cambiar la fecha en el calendario nativo
  onFechaCambiada(event: any) {
    this.fechaSeleccionada = event.detail.value;
    console.log('Fecha seleccionada:', this.fechaSeleccionada);
    
    // Aquí se implementará la consulta a la base de datos o almacenamiento según la fecha seleccionada
  }

}
