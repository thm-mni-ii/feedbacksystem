import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskSubmissionChoiceComponent } from './task-submission-choice.component';

describe('TaskSubmissionChoiceComponent', () => {
  let component: TaskSubmissionChoiceComponent;
  let fixture: ComponentFixture<TaskSubmissionChoiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskSubmissionChoiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskSubmissionChoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
