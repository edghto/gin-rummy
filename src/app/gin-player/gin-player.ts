import { Component, Input } from '@angular/core';
import { PlayerController } from '../services/player-controller.service';
import { Card } from '../services/card.model';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup,   transferArrayItem, } from '@angular/cdk/drag-drop';

@Component({
  selector: 'gin-player',
  imports: [CdkDropListGroup, CdkDropList, CdkDrag],
  templateUrl: './gin-player.html',
  styleUrl: './gin-player.scss',
  standalone: true,
})
export class GinPlayer {
  @Input({ required: true }) player!: PlayerController;

  discard(card: Card): void {
    this.player.discard(card);
  }
  drop(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer !== event.container) {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    this.player.sort();
  }
}
