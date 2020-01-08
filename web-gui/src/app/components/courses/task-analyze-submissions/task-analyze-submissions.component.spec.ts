import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskAnalyzeSubmissionsComponent } from './task-analyze-submissions.component';

describe('TaskAnalyzeSubmissionsComponent', () => {
  let component: TaskAnalyzeSubmissionsComponent;
  let fixture: ComponentFixture<TaskAnalyzeSubmissionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskAnalyzeSubmissionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskAnalyzeSubmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
