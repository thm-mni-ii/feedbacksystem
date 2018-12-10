import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentCourseDialogComponent } from './student-course-dialog.component';

describe('StudentCourseDialogComponent', () => {
  let component: StudentCourseDialogComponent;
  let fixture: ComponentFixture<StudentCourseDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentCourseDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentCourseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
