import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTestsystemsModalComponent } from './edit-testsystems-modal.component';

describe('EditTestsystemsModalComponent', () => {
  let component: EditTestsystemsModalComponent;
  let fixture: ComponentFixture<EditTestsystemsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTestsystemsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTestsystemsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
