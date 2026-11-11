import { TestBed } from '@angular/core/testing';

import { CompartirBebidasService } from './compartir-bebidas.service';

describe('CompartirBebidasService', () => {
  let service: CompartirBebidasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompartirBebidasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
