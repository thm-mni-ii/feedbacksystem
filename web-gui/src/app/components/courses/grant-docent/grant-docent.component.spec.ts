import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GrantDocentComponent } from './grant-docent.component';

describe('GrantDocentComponent', () => {
  let component: GrantDocentComponent;
  let fixture: ComponentFixture<GrantDocentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GrantDocentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GrantDocentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
