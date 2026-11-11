import { TestBed } from '@angular/core/testing';

import { ApiComidaService } from './api-comida.service';

describe('ApiComidaService', () => {
  let service: ApiComidaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiComidaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
