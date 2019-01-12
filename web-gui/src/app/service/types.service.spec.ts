import { TestBed, inject } from '@angular/core/testing';

import { TypesService } from './types.service';

describe('TypesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TypesService]
    });
  });

  it('should be created', inject([TypesService], (service: TypesService) => {
    expect(service).toBeTruthy();
  }));
});
