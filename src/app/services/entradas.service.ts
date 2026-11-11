import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export interface Entrada {
  id: string;
  fecha: string;     // ISO, ej. 2026-11-06T23:10:00.000Z
  texto: string;
  duracion: number;  // segundos
}

const CLAVE = 'entradas';

@Injectable({ providedIn: 'root' })
export class EntradasService {

  async listar(): Promise<Entrada[]> {
    const { value } = await Preferences.get({ key: CLAVE });
    return value ? JSON.parse(value) : [];
  }

  async guardar(datos: { texto: string; duracion: number }): Promise<Entrada> {
    const entrada: Entrada = {
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      texto: datos.texto,
      duracion: datos.duracion,
    };
    const lista = await this.listar();
    lista.unshift(entrada); // la más reciente primero
    await Preferences.set({ key: CLAVE, value: JSON.stringify(lista) });
    return entrada;
  }

  async ultima(): Promise<Entrada | undefined> {
    return (await this.listar())[0];
  }
}