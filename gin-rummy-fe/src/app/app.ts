import { Component, inject, OnInit, Signal, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GinPlayer } from './gin-player/gin-player';
import { CardPiles } from './card-piles/card-piles';
import { Phase, RoundController } from './services/round-controller.service';
import { Dealer } from './services/dealer.service';
import { PlayerController } from './services/player-controller.service';
import { parseHostBindings } from '@angular/compiler';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GinPlayer, CardPiles],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  providers: [Dealer, RoundController]
})
export class App implements OnInit {
  protected dealer = inject(Dealer);
  protected roundController = inject(RoundController);

  protected player!: PlayerController;
  protected opponent!: PlayerController;

  protected get pilesEnabled(): boolean {
    return this.roundController.phase === Phase.DRAW;
  }

  protected get ended(): boolean {
    return this.roundController.phase === Phase.END;
  }
  
  ngOnInit(): void {
    this.player = new PlayerController('player', this.dealer.player());
    this.opponent = new PlayerController('opponent', this.dealer.opponent());
    this.roundController.init(this.dealer, [this.player, this.opponent]);
  }
}
