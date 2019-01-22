import { TestBed, async, inject } from '@angular/core/testing';

import { ModeratorGuard } from './moderator.guard';

describe('ModeratorGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModeratorGuard]
    });
  });

  it('should ...', inject([ModeratorGuard], (guard: ModeratorGuard) => {
    expect(guard).toBeTruthy();
  }));
});
