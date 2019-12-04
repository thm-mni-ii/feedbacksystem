import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseResultDetailTableComponent } from './course-result-detail-table.component';

describe('CourseResultDetailTableComponent', () => {
  let component: CourseResultDetailTableComponent;
  let fixture: ComponentFixture<CourseResultDetailTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseResultDetailTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseResultDetailTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
