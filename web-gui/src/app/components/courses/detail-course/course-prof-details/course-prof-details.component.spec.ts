import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseProfDetailsComponent } from './course-prof-details.component';

describe('CourseProfDetailsComponent', () => {
  let component: CourseProfDetailsComponent;
  let fixture: ComponentFixture<CourseProfDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseProfDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseProfDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
