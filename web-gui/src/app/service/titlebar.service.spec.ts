import { TestBed, inject } from '@angular/core/testing';

import { TitlebarService } from './titlebar.service';

describe('TitlebarService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TitlebarService]
    });
  });

  it('should be created', inject([TitlebarService], (service: TitlebarService) => {
    expect(service).toBeTruthy();
  }));
});
