import { StudentModule } from './student.module';

describe('StudentModule', () => {
  let studentModule: StudentModule;

  beforeEach(() => {
    studentModule = new StudentModule();
  });

  it('should create an instance', () => {
    expect(studentModule).toBeTruthy();
  });
});
