import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPiles } from './card-piles';

describe('CardPiles', () => {
  let component: CardPiles;
  let fixture: ComponentFixture<CardPiles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardPiles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardPiles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
