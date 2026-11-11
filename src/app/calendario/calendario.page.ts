import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
  standalone: false, // <--- Agrega esta línea aquí
})
export class CalendarioPage implements OnInit {

  fechaSeleccionada: string = new Date().toISOString();

  constructor() { }

  ngOnInit() {}

  onFechaCambiada(event: any) {
    this.fechaSeleccionada = event.detail.value;
    console.log('Fecha seleccionada:', this.fechaSeleccionada);
  }

}

