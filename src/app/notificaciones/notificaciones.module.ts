import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular/lazy';

import { NotificacionesPage } from './notificaciones.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([{ path: '', component: NotificacionesPage }])
  ],
  declarations: [NotificacionesPage]
})
export class NotificacionesPageModule {}