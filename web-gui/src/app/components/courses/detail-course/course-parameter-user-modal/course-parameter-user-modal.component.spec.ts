import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseParameterUserModalComponent } from './course-parameter-user-modal.component';

describe('CourseParameterUserModalComponent', () => {
  let component: CourseParameterUserModalComponent;
  let fixture: ComponentFixture<CourseParameterUserModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseParameterUserModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseParameterUserModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
