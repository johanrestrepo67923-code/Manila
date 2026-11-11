import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { JuegoComponent } from './juego/juego.component';
import { PedidoComponent } from './pedido/pedido.component';
import { BebidasComponent } from './bebidas/bebidas.component';
import { ComidasComponent } from './comidas/comidas.component';

export const routes: Routes = [
  {path: 'inicio', component: InicioComponent},
  {path: 'comidas', component: ComidasComponent},
  {path: 'bebidas', component: BebidasComponent},
  {path: 'pedido', component: PedidoComponent},
  {path: 'juego', component: JuegoComponent},
  {path: '', component: InicioComponent},
{path: '**', redirectTo: ''},
];