import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { interval, Subscription } from 'rxjs';
import { EntradasService } from '../services/entradas.service';

type Estado = 'inactivo' | 'grabando' | 'pausado';

const esperar = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

@Component({
  selector: 'app-grabar',
  templateUrl: './grabar.page.html',
  styleUrls: ['./grabar.page.scss'],
  standalone: false,
})
export class GrabarPage implements OnDestroy {

  estado: Estado = 'inactivo';
  segundos = 0;
  textoMostrado = '';
  barras: number[] = Array(24).fill(4);

  private base = '';
  private parcial = '';
  private cronometro?: Subscription;
  private ondasSim?: Subscription;
  private audioCtx?: AudioContext;
  private analyser?: AnalyserNode;
  private stream?: MediaStream;
  private rafId = 0;
  private reiniciando = false;

  // true en Android/iOS, false en el navegador
  private nativo = Capacitor.isNativePlatform();

  constructor(
    private cdr: ChangeDetectorRef,
    private toast: ToastController,
    private entradas: EntradasService
  ) {}

  get titulo(): string {
    if (this.estado === 'grabando') return 'Grabando...';
    if (this.estado === 'pausado') return 'En pausa';
    return 'Toca el micrófono';
  }

  // El proyecto no usa zone.js: hay que avisar a Angular que redibuje
  private refrescar() {
    this.cdr.markForCheck();
  }

  // ---------- Controles ----------

  async iniciar() {
    try {
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
      await this.escuchar();
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
    this.limpiarTodo(); // por si llegó texto tardío
  }

  async confirmar() {
    const estabaActivo = this.estado !== 'inactivo';
    this.consolidar();
    const texto = this.textoMostrado.trim();
    const duracion = this.segundos;

    await this.finalizar(); // detiene cronómetro, ondas y plugin

    if (!texto) {
      this.limpiarTodo();
      if (estabaActivo) {
        this.mostrar('No escuchamos nada para guardar.', 'warning');
      }
      return;
    }

    try {
      await this.entradas.guardar({ texto, duracion });
      this.limpiarTodo(); // vacía el recuadro y reinicia el cronómetro
      this.mostrar('¡Entrada guardada!', 'success');
    } catch {
      this.mostrar('No pudimos guardar tu entrada, ¿lo intentamos de nuevo?');
    }
  }

  // Si el usuario edita la transcripción a mano
  alEditar(ev: any) {
    this.base = ev.detail.value || '';
    this.parcial = '';
  }

  // ---------- Reconocimiento de voz (solo en el teléfono) ----------

  private async registrarListeners() {
    await SpeechRecognition.removeAllListeners();

    SpeechRecognition.addListener('partialResults', (data: { matches: string[] }) => {
      if (this.estado !== 'grabando') return;
      this.parcial = data.matches?.[0] ?? '';
      this.actualizarTexto();
    });

    // Android corta la escucha tras un silencio: si seguimos grabando, se reinicia
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

  private async escuchar() {
    if (!this.nativo) return;
    await SpeechRecognition.start({
      language: 'es-MX',
      maxResults: 1,
      partialResults: true,
      popup: false,
    });
  }

  private async detenerEscucha() {
    if (!this.nativo) return;
    try {
      // si stop() se cuelga, no esperamos más de 1 segundo
      await Promise.race([SpeechRecognition.stop(), esperar(1000)]);
    } catch { /* ya estaba detenido */ }
  }

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

  // Primero se limpia todo lo local, y al final se detiene el plugin
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

  // ---------- Cronómetro y ondas ----------

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
      // En el teléfono el micrófono lo usa el dictado: las ondas son simuladas
      this.ondasSim?.unsubscribe();
      this.ondasSim = interval(120).subscribe(() => {
        this.barras = this.barras.map(() => 6 + Math.random() * 40);
        this.refrescar();
      });
    } else {
      this.ondasReales();
    }
  }

  // Solo en el navegador: ondas según el volumen real del micrófono
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
      // Sin acceso al nivel de audio, las ondas quedan quietas
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

  // ---------- Mensajes ----------

  private async mostrar(message: string, color = 'danger') {
    const t = await this.toast.create({ message, duration: 2500, position: 'top', color });
    await t.present();
  }

  ngOnDestroy() {
    this.finalizar();
  }
}