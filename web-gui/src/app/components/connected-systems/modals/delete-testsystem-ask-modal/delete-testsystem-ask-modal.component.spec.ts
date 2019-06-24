import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteTestsystemAskModalComponent } from './delete-testsystem-ask-modal.component';

describe('DeleteTestsystemAskModalComponent', () => {
  let component: DeleteTestsystemAskModalComponent;
  let fixture: ComponentFixture<DeleteTestsystemAskModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteTestsystemAskModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteTestsystemAskModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
