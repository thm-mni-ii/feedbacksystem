import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeratorStartComponent } from './moderator-start.component';

describe('ModeratorStartComponent', () => {
  let component: ModeratorStartComponent;
  let fixture: ComponentFixture<ModeratorStartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModeratorStartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModeratorStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
