import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular/lazy';

import { RevisarEntradaPageRoutingModule } from './revisar-entrada-routing.module';

import { RevisarEntradaPage } from './revisar-entrada.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RevisarEntradaPageRoutingModule
  ],
  declarations: [RevisarEntradaPage]
})
export class RevisarEntradaPageModule {}
