import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CompartirComidasService {

  constructor() { }

  private platformId = inject(PLATFORM_ID);
  public comidasSignal = signal<any>(this.obtenerComidasInicial());

  // lee lo que quedó guardado en el navegador (solo las comidas)
  private obtenerComidasInicial() {
    if (isPlatformBrowser(this.platformId)) {
      const comidasGuardadas = localStorage.getItem('comidas');
      return comidasGuardadas ? JSON.parse(comidasGuardadas) : [];
    }
    return [];
  }

  enviar(datosComidas: any) {
    console.log('Guardando dato:', datosComidas);
    this.comidasSignal.set(datosComidas);
    localStorage.setItem('comidas', JSON.stringify(datosComidas));
  }

  limpiar() {
    this.comidasSignal.set([]);
    localStorage.removeItem('comidas');
  }
}