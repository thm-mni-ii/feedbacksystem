import { TestBed, inject } from '@angular/core/testing';

import { MiscService } from './misc.service';

describe('MiscService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MiscService]
    });
  });

  it('should be created', inject([MiscService], (service: MiscService) => {
    expect(service).toBeTruthy();
  }));
});
