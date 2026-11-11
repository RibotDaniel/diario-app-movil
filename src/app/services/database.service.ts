import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

import {
    CapacitorSQLite,
    SQLiteConnection,
    SQLiteDBConnection
} from '@capacitor-community/sqlite';

@Injectable({
    providedIn: 'root'
})
export class DatabaseService {

    // Administrador de conexiones SQLite
    private sqlite = new SQLiteConnection(CapacitorSQLite);

    // Conexión activa
    private db: SQLiteDBConnection | null = null;

    // Evita inicializaciones simultáneas
    private inicializacion: Promise<void> | null = null;

    // Inicializar la base de datos
    async inicializar(): Promise<void> {

        if (this.db) {
            return;
        }

        if (this.inicializacion) {
            return this.inicializacion;
        }

        this.inicializacion = this.prepararBaseDatos();

        try {
            await this.inicializacion;
        } finally {
            this.inicializacion = null;
        }
    }

    // Preparar conexión y tablas
    private async prepararBaseDatos(): Promise<void> {

        const nombreBD = 'diario_db';

        // Configuración para el navegador
        if (Capacitor.getPlatform() === 'web') {

            await customElements.whenDefined('jeep-sqlite');

            if (!document.querySelector('jeep-sqlite')) {
                const jeep = document.createElement('jeep-sqlite');
                document.body.appendChild(jeep);
            }

            await this.sqlite.initWebStore();
        }

        // Verificar conexión existente
        const existe = await this.sqlite.isConnection(
            nombreBD,
            false
        );

        let conexion: SQLiteDBConnection;

        if (existe.result) {

            conexion = await this.sqlite.retrieveConnection(
                nombreBD,
                false
            );

        } else {

            conexion = await this.sqlite.createConnection(
                nombreBD,
                false,
                'no-encryption',
                1,
                false
            );
        }

        // Abrir la base de datos
        const abierta = await conexion.isDBOpen();

        if (!abierta.result) {
            await conexion.open();
        }

        // Crear tabla de usuarios
        await conexion.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        correo TEXT NOT NULL UNIQUE,
        contrasena_hash TEXT NOT NULL
      );
    `);

        // Guardar la conexión inicializada
        this.db = conexion;

        // Persistir estructura en el navegador
        await this.guardarCambios();

        console.log('Base de datos SQLite inicializada');
    }

    // Guardar cambios en el navegador
    async guardarCambios(): Promise<void> {

        if (Capacitor.getPlatform() === 'web') {
            await this.sqlite.saveToStore('diario_db');
        }
    }

    // Convertir bytes a hexadecimal
    private convertirHex(datos: Uint8Array): string {

        return Array.from(datos)
            .map(valor => valor.toString(16).padStart(2, '0'))
            .join('');
    }

    // Proteger la contraseña con PBKDF2
    private async generarHash(
        contrasena: string
    ): Promise<string> {

        const encoder = new TextEncoder();

        // Sal aleatoria para cada usuario
        const salt = crypto.getRandomValues(
            new Uint8Array(16)
        );

        const clave = await crypto.subtle.importKey(
            'raw',
            encoder.encode(contrasena),
            'PBKDF2',
            false,
            ['deriveBits']
        );

        // Derivar hash de contraseña
        const resultado = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 600000,
                hash: 'SHA-256'
            },
            clave,
            256
        );

        const saltHex = this.convertirHex(salt);

        const hashHex = this.convertirHex(
            new Uint8Array(resultado)
        );

        return `${saltHex}:${hashHex}`;
    }

    // Registrar un nuevo usuario
    async registrarUsuario(
        nombre: string,
        correo: string,
        contrasena: string
    ): Promise<void> {

        // Asegurar que SQLite esté inicializado
        await this.inicializar();

        if (!this.db) {
            throw new Error(
                'No se pudo abrir la base de datos'
            );
        }

        const nombreLimpio = nombre.trim();

        const correoNormalizado = correo
            .trim()
            .toLowerCase();

        // Validar datos
        if (
            !nombreLimpio ||
            !correoNormalizado ||
            !contrasena
        ) {
            throw new Error(
                'Completa todos los campos'
            );
        }

        // Verificar correo existente
        const existente = await this.db.query(
            'SELECT id FROM usuarios WHERE correo = ?',
            [correoNormalizado]
        );

        if (existente.values?.length) {
            throw new Error(
                'Este correo ya está registrado'
            );
        }

        // Generar hash seguro
        const hash = await this.generarHash(
            contrasena
        );

        // Insertar usuario en SQLite
        try {

            await this.db.run(
                `INSERT INTO usuarios
         (nombre, correo, contrasena_hash)
         VALUES (?, ?, ?)`,
                [
                    nombreLimpio,
                    correoNormalizado,
                    hash
                ]
            );

            // Guardar cambios en navegador
            await this.guardarCambios();

            console.log(
                'Usuario registrado correctamente'
            );

        } catch (error) {

            console.error(
                'Error al guardar usuario:',
                error
            );

            throw error;
        }
    }
}