import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminStartComponent } from './admin-start.component';

describe('AdminStartComponent', () => {
  let component: AdminStartComponent;
  let fixture: ComponentFixture<AdminStartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminStartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
