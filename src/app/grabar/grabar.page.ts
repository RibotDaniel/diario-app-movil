import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition'; // <--- PLUGIN DE VOZ
import { interval, Subscription } from 'rxjs';
import { EntradasService } from '../services/entradas.service';
import { Router } from '@angular/router';

type Estado = 'inactivo' | 'grabando' | 'pausado';

const esperar = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

@Component({
  selector: 'app-grabar',
  templateUrl: './grabar.page.html',
  styleUrls: ['./grabar.page.scss'],
  standalone: false,
})
export class GrabarPage implements OnDestroy {

  // ==========================================
  // 1. PROPIEDADES Y VARIABLES DE ESTADO
  // ==========================================
  estado: Estado = 'inactivo';
  segundos = 0;
  textoMostrado = '';
  barras: number[] = Array(24).fill(4);

  private base = '';
  private parcial = '';
  private cronometro?: Subscription;
  private ondasSim?: Subscription;
  private audioCtx?: AudioContext;         // <--- API WEB (Navegador - Audio)
  private analyser?: AnalyserNode;       // <--- API WEB (Navegador - Analizador)
  private stream?: MediaStream;          // <--- API WEB (Navegador - Stream de Micrófono)
  private rafId = 0;
  private reiniciando = false;

  // Detecta si corre en dispositivo físico (Android/iOS) o navegador web
  private nativo = Capacitor.isNativePlatform();
  constructor(
    private cdr: ChangeDetectorRef,
    private toast: ToastController,
    private entradas: EntradasService,
    private router: Router
  ) { }

  get titulo(): string {
    if (this.estado === 'grabando') return 'Grabando...';
    if (this.estado === 'pausado') return 'En pausa';
    return 'Toca el micrófono';
  }

  // Refresca la vista manualmente (necesario al no usar Zone.js)
  private refrescar() {
    this.cdr.markForCheck();
  }

  // ==========================================
  // 2. CONTROLES PRINCIPALES (UI Actions)
  // ==========================================

  async iniciar() {
    try {
      // Si estamos en el celular, validamos permisos y conectamos el plugin nativo
      if (this.nativo) {
        const { available } = await SpeechRecognition.available();
        if (!available) {
          return this.mostrar('Tu dispositivo no permite dictado por voz.');
        }

        let permiso = await SpeechRecognition.checkPermissions();
        if (permiso.speechRecognition !== 'granted') {
          permiso = await SpeechRecognition.requestPermissions();
        }
        if (permiso.speechRecognition !== 'granted') {
          return this.mostrar('Necesitamos permiso del micrófono para escucharte.');
        }
        await this.registrarListeners();
      } else {
        this.mostrar('Modo prueba: la transcripción solo funciona en el teléfono.', 'medium');
      }

      this.base = '';
      this.parcial = '';
      this.segundos = 0;
      this.textoMostrado = '';
      this.estado = 'grabando';
      this.refrescar();

      this.iniciarCronometro();
      this.iniciarOndas();
      await this.escuchar(); // <--- LLAMADA AL PLUGIN DE VOZ
    } catch {
      this.limpiarTemporizadores();
      this.estado = 'inactivo';
      this.refrescar();
      this.mostrar('No pudimos escucharte bien, ¿lo intentamos de nuevo?');
    }
  }

  async pausarOReanudar() {
    if (this.estado === 'grabando') {
      this.estado = 'pausado';
      this.limpiarTemporizadores();
      this.consolidar();
      this.refrescar();
      await this.detenerEscucha();
    } else if (this.estado === 'pausado') {
      this.estado = 'grabando';
      this.iniciarCronometro();
      this.iniciarOndas();
      this.refrescar();
      try {
        await this.escuchar();
      } catch {
        this.reiniciar();
      }
    }
  }

  async cancelar() {
    this.limpiarTodo();
    await this.finalizar();
    this.limpiarTodo();
  }


  async confirmar() {
    const estabaActivo = this.estado !== 'inactivo';

    const texto = this.textoMostrado.trim();
    const duracion = this.segundos;
    console.log('Texto visible al confirmar:', this.textoMostrado);
    console.log('Texto enviado a Revisar:', texto);
    console.log('Duración enviada:', duracion);

    // Detener el reconocimiento y el cronómetro
    await this.finalizar();

    // Comprobar que exista una transcripción
    if (!texto) {
      this.limpiarTodo();

      if (estabaActivo) {
        this.mostrar('No escuchamos nada para revisar.', 'warning');
      }
      return;
    }

    // Enviar los datos a la nueva pantalla
    const navegacion = await this.router.navigate(
      ['/tabs/revisar-entrada'],
      {
        state: {
          transcripcion: texto,
          duracion: duracion
        }
      }
    );
  }


  alEditar(ev: any) {
    this.base = ev.detail.value || '';
    this.parcial = '';
  }

  // ==========================================
  // 3. NÚCLEO DEL PLUGIN DE RECONOCIMIENTO DE VOZ
  // ==========================================

  private async registrarListeners() {
    await SpeechRecognition.removeAllListeners();

    // Captura transcripciones en tiempo real que devuelve el sistema
    SpeechRecognition.addListener('partialResults', (data: { matches: string[] }) => {
      if (this.estado !== 'grabando') return;
      this.parcial = data.matches?.[0] ?? '';
      this.actualizarTexto();
    });

    // Android corta el dictado por silencio: aquí detectamos y auto-reiniciamos
    SpeechRecognition.addListener('listeningState', (data: { status: 'started' | 'stopped' }) => {
      if (data.status === 'stopped' && this.estado === 'grabando') {
        this.consolidar();
        this.reiniciar();
      }
    });
  }

  private async reiniciar() {
    if (this.reiniciando) return;
    this.reiniciando = true;
    try {
      for (let i = 0; i < 3; i++) {
        await esperar(400);
        if (this.estado !== 'grabando') break;
        try {
          await this.escuchar();
          break;
        } catch { /* reintenta */ }
      }
    } finally {
      this.reiniciando = false;
    }
  }

  // Método nativo que enciende el reconocimiento de voz
  private async escuchar() {
    if (!this.nativo) return;
    await SpeechRecognition.start({
      language: 'es-MX',
      maxResults: 1,
      partialResults: true,
      popup: false,
    });
  }

  // Método nativo que detiene el reconocimiento de voz
  private async detenerEscucha() {
    if (!this.nativo) return;
    try {
      await Promise.race([SpeechRecognition.stop(), esperar(1000)]);
    } catch { /* ya estaba detenido */ }
  }

  // ==========================================
  // 4. MANEJO DE TEXTO Y ESTADOS INTERNOS
  // ==========================================

  private consolidar() {
    if (this.parcial) {
      this.base = (this.base + ' ' + this.parcial).trim();
      this.parcial = '';
    }
    this.actualizarTexto();
  }

  private actualizarTexto() {
    this.textoMostrado = (this.base + ' ' + this.parcial).trim();
    this.refrescar();
  }

  private limpiarTodo() {
    this.base = '';
    this.parcial = '';
    this.textoMostrado = '';
    this.segundos = 0;
    this.refrescar();
  }

  private async finalizar() {
    this.estado = 'inactivo';
    this.limpiarTemporizadores();
    this.refrescar();

    await this.detenerEscucha();
    if (this.nativo) {
      try {
        await SpeechRecognition.removeAllListeners();
      } catch { /* sin listeners */ }
    }
  }

  // ==========================================
  // 5. CRONÓMETRO Y ANIMACIÓN DE ONDAS (API Web / Simulación)
  // ==========================================

  private limpiarTemporizadores() {
    this.cronometro?.unsubscribe();
    this.cronometro = undefined;
    this.detenerOndas();
  }

  private iniciarCronometro() {
    this.cronometro?.unsubscribe();
    this.cronometro = interval(1000).subscribe(() => {
      this.segundos++;
      this.refrescar();
    });
  }

  private iniciarOndas() {
    if (this.nativo) {
      // En teléfono móvil simulamos las ondas (el plugin ocupa el micrófono y no deja duplicar flujo)
      this.ondasSim?.unsubscribe();
      this.ondasSim = interval(120).subscribe(() => {
        this.barras = this.barras.map(() => 6 + Math.random() * 40);
        this.refrescar();
      });
    } else {
      this.ondasReales(); // En navegador usamos Web Audio API
    }
  }

  // API Web usada exclusivamente en navegadores para medir volumen real del mic
  private async ondasReales() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioCtx = new AudioContext();
      await this.audioCtx.resume();
      const source = this.audioCtx.createMediaStreamSource(this.stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const datos = new Uint8Array(this.analyser.frequencyBinCount);
      const dibujar = () => {
        this.analyser!.getByteFrequencyData(datos);
        this.barras = this.barras.map((_, i) => 4 + (datos[i] / 255) * 48);
        this.refrescar();
        this.rafId = requestAnimationFrame(dibujar);
      };
      dibujar();
    } catch {
      // Sin acceso al nivel de audio
    }
  }

  private detenerOndas() {
    this.ondasSim?.unsubscribe();
    this.ondasSim = undefined;
    cancelAnimationFrame(this.rafId);
    this.stream?.getTracks().forEach(t => t.stop());
    this.audioCtx?.close();
    this.stream = undefined;
    this.audioCtx = undefined;
    this.barras = Array(24).fill(4);
    this.refrescar();
  }

  // ==========================================
  // 6. MENSAJES Y CICLO DE VIDA
  // ==========================================

  private async mostrar(message: string, color = 'danger') {
    const t = await this.toast.create({ message, duration: 2500, position: 'top', color });
    await t.present();
  }

  ngOnDestroy() {
    this.finalizar();
  }
}