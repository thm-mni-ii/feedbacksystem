import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfCoursesComponent } from './prof-courses.component';

describe('ProfCoursesComponent', () => {
  let component: ProfCoursesComponent;
  let fixture: ComponentFixture<ProfCoursesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfCoursesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
