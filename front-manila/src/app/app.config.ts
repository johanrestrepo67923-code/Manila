import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

// para que los precios salgan como $12.000
registerLocaleData(localeEsCo);

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideClientHydration(), { provide: LOCALE_ID, useValue: 'es-CO' }]
};
