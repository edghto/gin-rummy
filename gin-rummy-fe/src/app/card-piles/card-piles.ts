import { Component, inject, Input } from '@angular/core';
import { Dealer } from '../services/dealer.service';

@Component({
  selector: 'card-piles',
  standalone: true,
  imports: [],
  templateUrl: './card-piles.html',
  styleUrl: './card-piles.scss',
})
export class CardPiles {
  protected emptyPile = false;
  private dealer = inject(Dealer);
  protected card = this.dealer.lastDiscardedCard;
  @Input() enabled: boolean = true;
  @Input() ended = false;

  pickFromStock(): void {
    if (this.dealer.pickFromStock() === 0) {
      this.emptyPile = true;
    }
  }

  pickFromDiscarded(): void {
    if (this.enabled) {
      this.dealer.pickFromDiscarded();
    }
  }
}
