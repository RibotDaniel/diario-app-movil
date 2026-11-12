import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { defineCustomElements } from 'jeep-sqlite/loader';
import { AppModule } from './app/app.module';

// Registrar el componente SQLite para navegador
defineCustomElements(window);

// Iniciar Angular
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));