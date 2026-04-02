import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulingFormComponent } from './scheduling-form.component';

describe('SchedulingFormComponent', () => {
  let component: SchedulingFormComponent;
  let fixture: ComponentFixture<SchedulingFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchedulingFormComponent]
    });
    fixture = TestBed.createComponent(SchedulingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
