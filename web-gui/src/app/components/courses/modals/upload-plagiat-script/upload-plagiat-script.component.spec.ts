import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadPlagiatScriptComponent } from './upload-plagiat-script.component';

describe('UploadPlagiatScriptComponent', () => {
  let component: UploadPlagiatScriptComponent;
  let fixture: ComponentFixture<UploadPlagiatScriptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadPlagiatScriptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadPlagiatScriptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
