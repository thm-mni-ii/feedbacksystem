import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpressumDialogComponent } from './impressum-dialog.component';

describe('ImpressumDialogComponent', () => {
  let component: ImpressumDialogComponent;
  let fixture: ComponentFixture<ImpressumDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImpressumDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImpressumDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
