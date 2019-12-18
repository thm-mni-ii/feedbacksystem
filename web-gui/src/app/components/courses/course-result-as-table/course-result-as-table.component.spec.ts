import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseResultAsTableComponent } from './course-result-as-table.component';

describe('CourseResultAsTableComponent', () => {
  let component: CourseResultAsTableComponent;
  let fixture: ComponentFixture<CourseResultAsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseResultAsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseResultAsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
