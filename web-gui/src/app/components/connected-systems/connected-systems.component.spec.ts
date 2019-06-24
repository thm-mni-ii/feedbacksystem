import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectedSystemsComponent } from './connected-systems.component';

describe('ConnectedSystemsComponent', () => {
  let component: ConnectedSystemsComponent;
  let fixture: ComponentFixture<ConnectedSystemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectedSystemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectedSystemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
