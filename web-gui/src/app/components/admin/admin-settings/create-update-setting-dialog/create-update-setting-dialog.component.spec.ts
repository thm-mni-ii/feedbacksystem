import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateSettingDialogComponent } from './create-update-setting-dialog.component';

describe('CreateUpdateSettingDialogComponent', () => {
  let component: CreateUpdateSettingDialogComponent;
  let fixture: ComponentFixture<CreateUpdateSettingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateUpdateSettingDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateUpdateSettingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
