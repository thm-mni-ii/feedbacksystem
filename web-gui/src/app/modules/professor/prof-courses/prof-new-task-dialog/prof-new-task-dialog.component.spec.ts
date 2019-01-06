import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfNewTaskDialogComponent } from './prof-new-task-dialog.component';

describe('ProfNewTaskDialogComponent', () => {
  let component: ProfNewTaskDialogComponent;
  let fixture: ComponentFixture<ProfNewTaskDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfNewTaskDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfNewTaskDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
