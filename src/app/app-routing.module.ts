import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'registro',
    loadChildren: () =>
      import('./registro/registro.module').then(m => m.RegistroPageModule)
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module')
        .then(m => m.LoginPageModule)
  },
  {
    path: 'configuracion',
    loadChildren: () =>
      import('./configuracion/configuracion.module')
        .then(m => m.ConfiguracionPageModule)
  },  {
    path: 'editar-perfil',
    loadChildren: () => import('./editar-perfil/editar-perfil.module').then( m => m.EditarPerfilPageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}