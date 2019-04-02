import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerFromTestsystemDialogComponent } from './answer-from-testsystem-dialog.component';

describe('AnswerFromTestsystemDialogComponent', () => {
  let component: AnswerFromTestsystemDialogComponent;
  let fixture: ComponentFixture<AnswerFromTestsystemDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnswerFromTestsystemDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerFromTestsystemDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
