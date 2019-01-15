import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExitCourseComponent } from './exit-course.component';

describe('ExitCourseComponent', () => {
  let component: ExitCourseComponent;
  let fixture: ComponentFixture<ExitCourseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExitCourseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExitCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
