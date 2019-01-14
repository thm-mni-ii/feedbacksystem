import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewtaskDialogComponent } from './newtask-dialog.component';

describe('NewtaskDialogComponent', () => {
  let component: NewtaskDialogComponent;
  let fixture: ComponentFixture<NewtaskDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewtaskDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewtaskDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
