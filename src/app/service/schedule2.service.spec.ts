import { TestBed } from '@angular/core/testing';

import { Schedule2Service } from './schedule2.service';

describe('Schedule2Service', () => {
  let service: Schedule2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Schedule2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
