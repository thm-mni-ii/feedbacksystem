import { ModeratorModule } from './moderator.module';

describe('ModeratorModule', () => {
  let moderatorModule: ModeratorModule;

  beforeEach(() => {
    moderatorModule = new ModeratorModule();
  });

  it('should create an instance', () => {
    expect(moderatorModule).toBeTruthy();
  });
});
