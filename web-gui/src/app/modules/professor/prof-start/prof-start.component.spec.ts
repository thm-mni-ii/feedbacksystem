import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfStartComponent } from './prof-start.component';

describe('ProfStartComponent', () => {
  let component: ProfStartComponent;
  let fixture: ComponentFixture<ProfStartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfStartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
