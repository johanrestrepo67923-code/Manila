import { TestBed } from '@angular/core/testing';

import { ApiBebidaService } from './api-bebida.service';

describe('ApiBebidaService', () => {
  let service: ApiBebidaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiBebidaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
