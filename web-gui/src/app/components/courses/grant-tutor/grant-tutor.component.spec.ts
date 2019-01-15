import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GrantTutorComponent } from './grant-tutor.component';

describe('GrantTutorComponent', () => {
  let component: GrantTutorComponent;
  let fixture: ComponentFixture<GrantTutorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GrantTutorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GrantTutorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
