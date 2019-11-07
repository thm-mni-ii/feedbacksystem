import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePasswdComponent } from './change-passwd.component';

describe('ChangePasswdComponent', () => {
  let component: ChangePasswdComponent;
  let fixture: ComponentFixture<ChangePasswdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangePasswdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePasswdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
