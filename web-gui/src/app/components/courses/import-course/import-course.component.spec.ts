import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportCourseComponent } from './import-course.component';

describe('ImportCourseComponent', () => {
  let component: ImportCourseComponent;
  let fixture: ComponentFixture<ImportCourseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportCourseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
