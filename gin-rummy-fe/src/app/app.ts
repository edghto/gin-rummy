import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {  RouterOutlet } from '@angular/router';
import { GinPlayer } from './gin-player/gin-player';
import { CardPiles } from './card-piles/card-piles';
import { Phase, RoundController } from './services/round-controller.service';
import { Dealer } from './services/dealer.service';
import { UserPlayerController } from './services/player-controller/user.service';
import { AIPlayerController } from './services/player-controller/ai.service';
import { HttpClient } from '@angular/common/http';
import { DISCADED_CARDS_SERVICE_TOKEN } from './services/discarded-card.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GinPlayer, CardPiles],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  providers: [
    Dealer,
    RoundController,
    HttpClient,
    { provide: DISCADED_CARDS_SERVICE_TOKEN, useExisting: Dealer }
  ]
})
export class App implements OnInit, OnDestroy {
  protected hidden = true;
  protected dealer = inject(Dealer);
  protected roundController = inject(RoundController);
  private httpClient = inject(HttpClient);

  protected player!: UserPlayerController;
  protected opponent!: AIPlayerController;

  protected get pilesEnabled(): boolean {
    return this.roundController.phase === Phase.DRAW;
  }

  protected get ended(): boolean {
    return this.roundController.phase === Phase.END;
  }

  ngOnInit(): void {
    this.player = new UserPlayerController(this.dealer.player());
    this.opponent = new AIPlayerController(this.dealer.opponent(), this.httpClient, this.dealer);
    this.roundController.init(this.dealer, [this.player, this.opponent]);
  }

  ngOnDestroy(): void {
    this.opponent.unsubscribe();
  }
}
