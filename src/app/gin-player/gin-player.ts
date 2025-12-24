import { Component, Input } from '@angular/core';
import { PlayerController } from '../services/player-controller.service';
import { Card } from '../services/card.model';

@Component({
  selector: 'gin-player',
  imports: [],
  templateUrl: './gin-player.html',
  styleUrl: './gin-player.scss',
  standalone: true,
})
export class GinPlayer {
  @Input({ required: true }) player!: PlayerController;

  discard(card: Card): void {
    this.player.discard(card);
  }
}
