import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GrandTutorSnippComponent } from './grand-tutor-snipp.component';

describe('GrandTutorSnippComponent', () => {
  let component: GrandTutorSnippComponent;
  let fixture: ComponentFixture<GrandTutorSnippComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GrandTutorSnippComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GrandTutorSnippComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
