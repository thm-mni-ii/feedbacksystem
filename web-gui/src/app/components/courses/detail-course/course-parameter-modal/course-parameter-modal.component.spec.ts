import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseParameterModalComponent } from './course-parameter-modal.component';

describe('CourseParameterModalComponent', () => {
  let component: CourseParameterModalComponent;
  let fixture: ComponentFixture<CourseParameterModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseParameterModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseParameterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
