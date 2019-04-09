import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotFound404Component } from './not-found404.component';

describe('NotFound404Component', () => {
  let component: NotFound404Component;
  let fixture: ComponentFixture<NotFound404Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotFound404Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotFound404Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
