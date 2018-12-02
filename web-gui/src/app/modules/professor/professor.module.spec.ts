import { ProfessorModule } from './professor.module';

describe('ProfessorModule', () => {
  let professorModule: ProfessorModule;

  beforeEach(() => {
    professorModule = new ProfessorModule();
  });

  it('should create an instance', () => {
    expect(professorModule).toBeTruthy();
  });
});
