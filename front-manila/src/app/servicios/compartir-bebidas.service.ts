import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CompartirBebidasService {

  constructor() { }

  private platformId = inject(PLATFORM_ID);
  public bebidasSignal = signal<any>(this.obtenerBebidasInicial());

  // lee lo que quedó guardado en el navegador (solo las bebidas)
  private obtenerBebidasInicial() {
    if (isPlatformBrowser(this.platformId)) {
      const bebidasGuardadas = localStorage.getItem('bebidas');
      return bebidasGuardadas ? JSON.parse(bebidasGuardadas) : [];
    }
    return [];
  }

  enviar(datosBebidas: any) {
    console.log('Guardando dato:', datosBebidas);
    this.bebidasSignal.set(datosBebidas);
    localStorage.setItem('bebidas', JSON.stringify(datosBebidas));
  }

  limpiar() {
    this.bebidasSignal.set([]);
    localStorage.removeItem('bebidas');
  }
}