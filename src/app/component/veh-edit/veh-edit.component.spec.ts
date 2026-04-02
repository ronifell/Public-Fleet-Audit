import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehEditComponent } from './veh-edit.component';

describe('VehEditComponent', () => {
  let component: VehEditComponent;
  let fixture: ComponentFixture<VehEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VehEditComponent]
    });
    fixture = TestBed.createComponent(VehEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
