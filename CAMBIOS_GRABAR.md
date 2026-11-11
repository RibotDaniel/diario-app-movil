# Cambios: página Grabar (Mi Esencia)

Rama: `DEV_Natita`
Ruta de la página: `/tabs/grabar`

## Resumen

Se agregó la página **Grabar**, que graba la voz y la transcribe en tiempo real, con cronómetro, ondas de sonido y botones de descartar, guardar y pausar. Al guardar, la entrada se almacena en el teléfono. La app se probó en un Samsung SM-A356E con Android Studio.

## 1. Paquetes instalados (terminal)

```bash
npm i @capacitor-community/speech-recognition   # transcripción de voz (v7.0.1)
npm i @capacitor/haptics                        # instalado, aún sin usar en código
npm i @fontsource/nunito @fontsource/inter      # fuentes de la guía de estilo
npm i @capacitor/core@latest @capacitor/cli@latest @capacitor/android@latest   # alineados en 8.6.0
npm i @capacitor/preferences                    # guardado de entradas (v8.0.1)
```

Después de instalar, **todo el equipo debe correr `npm install`**.

Nota: el plugin de voz solo tiene versión 7.x (no existe 8.x). Funcionó con Capacitor 8 en las pruebas.

## 2. Archivos y carpetas NUEVOS

| Ruta | Descripción |
|---|---|
| `src/app/grabar/grabar.page.html` | Vista: cuadrícula Ionic, micrófono, cronómetro, ondas, botones, transcripción |
| `src/app/grabar/grabar.page.scss` | Estilos con la paleta de la guía |
| `src/app/grabar/grabar.page.ts` | Lógica: plugin de voz, cronómetro, ondas, guardado |
| `src/app/grabar/grabar.module.ts` | Módulo de la página |
| `src/app/grabar/grabar-routing.module.ts` | Ruta interna de la página |
| `src/app/grabar/grabar.page.spec.ts` | Prueba generada por Ionic (sin cambios) |
| `src/app/services/entradas.service.ts` | Servicio que guarda y lee entradas con `@capacitor/preferences` |
| `android/` (carpeta completa) | Proyecto nativo Android creado con `npx cap add android` |

## 3. Archivos que YA EXISTÍAN y se modificaron

| Archivo | Cambio |
|---|---|
| `src/app/tabs/tabs-routing.module.ts` | Se agregó la ruta `grabar` dentro de `children` (carga perezosa de `GrabarPageModule`) |
| `src/app/app-routing.module.ts` | Ionic agregó una ruta `grabar` al generar la página; **se eliminó** porque la ruta vive en las tabs |
| `src/theme/variables.scss` | Estaba vacío. Se agregó la paleta de la guía (primary, secondary, tertiary, success, warning, danger, medium, light, dark), fondo, color de texto y fuente |
| `src/global.scss` | Se importan las fuentes Nunito e Inter y se comentó `dark.system.css` (el modo oscuro propio queda pendiente) |
| `src/app/app.module.ts` | `IonicModule.forRoot({ mode: 'md', scrollAssist: false })` para evitar que la pantalla salte al tocar la transcripción |
| `capacitor.config.ts` | `appId: 'com.miesencia.app'`, `appName: 'Mi Esencia'`, `webDir: 'www'` |
| `capacitor.config.json` | Eliminado (queda solo el `.ts`) |
| `package.json` y `package-lock.json` | Dependencias nuevas y Capacitor actualizado a 8.6.0 |

## 4. Configuración de Android

Archivo: `android/app/src/main/AndroidManifest.xml`

- Permiso de micrófono: `<uses-permission android:name="android.permission.RECORD_AUDIO" />`
- Bloque `<queries>` con `android.speech.RecognitionService`, necesario en Android 11+ para encontrar el servicio de voz.

## 5. Cómo funciona la página

- **Micrófono**: inicia la grabación y la transcripción en vivo (se pone rojo con pulso).
- **✕ Descartar**: detiene y borra el texto.
- **✓ Guardar**: detiene, guarda la entrada (texto, fecha y duración) y vacía el recuadro.
- **⏸ / ▶**: pausa o reanuda.
- **Ondas**: en el navegador siguen el volumen real; en el teléfono son **simuladas** (el plugin no entrega volumen y abrir otro acceso al micrófono cortaba el dictado).
- **Sin `zone.js`**: el proyecto no lo usa, por eso la página llama a `ChangeDetectorRef.markForCheck()` al cambiar datos fuera de un clic.
- **Reinicio automático**: Android corta el dictado tras un silencio; la página lo reinicia hasta 3 veces.

## 6. Dónde se guarda la información

`@capacitor/preferences`, clave `entradas`, como lista JSON (`id`, `fecha`, `texto`, `duracion`). Es almacenamiento privado de la app en el teléfono. No se ve desde el celular y se pierde si se desinstala la app. Todavía ninguna pantalla lee las entradas (Inicio y Calendario quedan pendientes).

## 7. Cómo probar

**Navegador** (animaciones y ondas, sin transcripción):

```bash
npm install
npm start
```

**Teléfono Android** (transcripción real):

```bash
npm install
npm run build
npx cap sync
npx cap open android
```

Requisitos: Android Studio, JDK 21 (en el aviso de Gradle elegir "Use JVM 21"), teléfono con Depuración USB y app Google instalada. Después, conectar el teléfono, elegirlo y presionar Run.

## 8. Pendientes

- Mostrar la última entrada en Inicio y la lista en Calendario.
- Guardar el audio (`capacitor-voice-recorder`) y la vibración (`@capacitor/haptics`).
- Ondas reales en el teléfono.
- Header compartido (`app-header`) para notificaciones, perfil y configuración.
- Modo oscuro propio.
- Los errores `Cannot match any routes: 'tabs/calendario'` y `'tabs/estadisticas'` vienen de pestañas cuyas páginas aún no existen.
