import { TestBed, async, inject } from '@angular/core/testing';

import { DocentGuard } from './docent.guard';

describe('DocentGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DocentGuard]
    });
  });

  it('should ...', inject([DocentGuard], (guard: DocentGuard) => {
    expect(guard).toBeTruthy();
  }));
});
