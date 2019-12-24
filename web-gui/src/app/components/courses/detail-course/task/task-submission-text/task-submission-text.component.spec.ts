import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskSubmissionTextComponent } from './task-submission-text.component';

describe('TaskSubmissionTextComponent', () => {
  let component: TaskSubmissionTextComponent;
  let fixture: ComponentFixture<TaskSubmissionTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskSubmissionTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskSubmissionTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
