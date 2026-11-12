import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite } from '@capacitor-community/sqlite';
import { Preferences } from '@capacitor/preferences';
import { DatabaseService } from './database.service';

const BD = 'diario_db';

export interface Entrada {
  id: number;
  usuario_id: number;
  texto: string;
  duracion: number;       // segundos
  creado_en: string;      // ISO, ej. 2026-11-06T23:10:00.000Z
  actualizado_en: string; // ISO
}

@Injectable({ providedIn: 'root' })
export class EntradasService {

  constructor(private database: DatabaseService) {}

  // Id de la cuenta con sesión iniciada. El login debe guardarlo al entrar:
  // await Preferences.set({ key: 'usuarioId', value: String(usuario.id) });
  private async usuarioActual(): Promise<number> {
    const { value } = await Preferences.get({ key: 'usuarioId' });
    if (!value) {
      throw new Error('No hay una sesión iniciada');
    }
    return Number(value);
  }

  // En el navegador la base vive en IndexedDB y hay que persistirla
  private async persistir(): Promise<void> {
    if (Capacitor.getPlatform() === 'web') {
      await CapacitorSQLite.saveToStore({ database: BD });
    }
  }

  async listar(): Promise<Entrada[]> {
    await this.database.inicializar();
    const usuarioId = await this.usuarioActual();

    const res = await CapacitorSQLite.query({
      database: BD,
      statement: `SELECT * FROM transcripciones
        WHERE usuario_id = ? ORDER BY creado_en DESC`,
      values: [usuarioId]
    });

    return (res.values ?? []) as Entrada[];
  }

  async guardar(datos: { texto: string; duracion: number }): Promise<void> {
    await this.database.inicializar();
    const usuarioId = await this.usuarioActual();
    const ahora = new Date().toISOString();

    await CapacitorSQLite.run({
      database: BD,
      statement: `INSERT INTO transcripciones
        (usuario_id, texto, duracion, creado_en, actualizado_en)
        VALUES (?, ?, ?, ?, ?)`,
      values: [usuarioId, datos.texto.trim(), datos.duracion, ahora, ahora]
    });

    await this.persistir();
  }

  async ultima(): Promise<Entrada | undefined> {
    return (await this.listar())[0];
  }

  async actualizar(id: number, texto: string): Promise<void> {
    await this.database.inicializar();

    await CapacitorSQLite.run({
      database: BD,
      statement: `UPDATE transcripciones
        SET texto = ?, actualizado_en = ? WHERE id = ?`,
      values: [texto.trim(), new Date().toISOString(), id]
    });

    await this.persistir();
  }
}