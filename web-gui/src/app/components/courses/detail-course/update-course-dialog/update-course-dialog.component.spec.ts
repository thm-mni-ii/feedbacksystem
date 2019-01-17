import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCourseDialogComponent } from './update-course-dialog.component';

describe('UpdateCourseDialogComponent', () => {
  let component: UpdateCourseDialogComponent;
  let fixture: ComponentFixture<UpdateCourseDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateCourseDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateCourseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
