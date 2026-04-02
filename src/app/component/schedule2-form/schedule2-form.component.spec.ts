import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Schedule2FormComponent } from './schedule2-form.component';

describe('Schedule2FormComponent', () => {
  let component: Schedule2FormComponent;
  let fixture: ComponentFixture<Schedule2FormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Schedule2FormComponent]
    });
    fixture = TestBed.createComponent(Schedule2FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
