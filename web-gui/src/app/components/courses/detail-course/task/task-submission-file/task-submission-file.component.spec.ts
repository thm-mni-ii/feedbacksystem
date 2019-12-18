import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskSubmissionFileComponent } from './task-submission-file.component';

describe('TaskSubmissionFileComponent', () => {
  let component: TaskSubmissionFileComponent;
  let fixture: ComponentFixture<TaskSubmissionFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskSubmissionFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskSubmissionFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
