import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GrantTutorSnippComponent } from './grant-tutor-snipp.component';

describe('GrandTutorSnippComponent', () => {
  let component: GrantTutorSnippComponent;
  let fixture: ComponentFixture<GrantTutorSnippComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GrantTutorSnippComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GrantTutorSnippComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
