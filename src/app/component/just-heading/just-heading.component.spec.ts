import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JustHeadingComponent } from './just-heading.component';

describe('JustHeadingComponent', () => {
  let component: JustHeadingComponent;
  let fixture: ComponentFixture<JustHeadingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JustHeadingComponent]
    });
    fixture = TestBed.createComponent(JustHeadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
