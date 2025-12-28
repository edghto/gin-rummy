import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GinPlayer } from './gin-player';

describe('GinPlayer', () => {
  let component: GinPlayer;
  let fixture: ComponentFixture<GinPlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GinPlayer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GinPlayer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
