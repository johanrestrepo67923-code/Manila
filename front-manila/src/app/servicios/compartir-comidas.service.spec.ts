import { TestBed } from '@angular/core/testing';

import { CompartirComidasService } from './compartir-comidas.service';

describe('CompartirComidasService', () => {
  let service: CompartirComidasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompartirComidasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
