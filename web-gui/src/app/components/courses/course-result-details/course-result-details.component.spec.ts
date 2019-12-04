import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseResultDetailsComponent } from './course-result-details.component';

describe('CourseResultDetailsComponent', () => {
  let component: CourseResultDetailsComponent;
  let fixture: ComponentFixture<CourseResultDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseResultDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseResultDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
