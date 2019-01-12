import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailCourseComponent } from './detail-course.component';

describe('DetailCourseComponent', () => {
  let component: DetailCourseComponent;
  let fixture: ComponentFixture<DetailCourseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailCourseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
