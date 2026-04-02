import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscontinuedVehicleFormComponent } from './discontinued-vehicle-form.component';

describe('DiscontinuedVehicleFormComponent', () => {
  let component: DiscontinuedVehicleFormComponent;
  let fixture: ComponentFixture<DiscontinuedVehicleFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DiscontinuedVehicleFormComponent]
    });
    fixture = TestBed.createComponent(DiscontinuedVehicleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
