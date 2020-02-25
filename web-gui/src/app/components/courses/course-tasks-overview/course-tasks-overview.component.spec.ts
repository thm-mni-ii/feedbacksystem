import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseTasksOverviewComponent } from './course-tasks-overview.component';

describe('CourseTasksOverviewComponent', () => {
  let component: CourseTasksOverviewComponent;
  let fixture: ComponentFixture<CourseTasksOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseTasksOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseTasksOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
