import { TestBed, async, inject } from '@angular/core/testing';

import { IsDocentGuard } from './is-docent.guard';

describe('IsDocentGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IsDocentGuard]
    });
  });

  it('should ...', inject([IsDocentGuard], (guard: IsDocentGuard) => {
    expect(guard).toBeTruthy();
  }));
});
