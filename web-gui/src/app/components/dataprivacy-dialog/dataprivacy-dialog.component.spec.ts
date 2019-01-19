import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataprivacyDialogComponent } from './dataprivacy-dialog.component';

describe('DataprivacyDialogComponent', () => {
  let component: DataprivacyDialogComponent;
  let fixture: ComponentFixture<DataprivacyDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataprivacyDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataprivacyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
