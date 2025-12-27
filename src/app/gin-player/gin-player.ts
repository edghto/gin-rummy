import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { PlayerController } from '../services/player-controller.service';
import { Card, Meld } from '../services/card.model';
import { CdkDrag, CdkDragDrop, CdkDragEnd, CdkDragStart, CdkDropList, CdkDropListGroup, transferArrayItem, } from '@angular/cdk/drag-drop';

@Component({
  selector: 'gin-player',
  imports: [CdkDropListGroup, CdkDropList, CdkDrag],
  templateUrl: './gin-player.html',
  styleUrl: './gin-player.scss',
  standalone: true,
})
export class GinPlayer {
  @Input({ required: true }) player!: PlayerController;
  @Output() dragStarted = new EventEmitter<Card>()
  @Output() dragEnded = new EventEmitter<Card>()
  protected dragging: boolean = false;

  private cd = inject(ChangeDetectorRef);

  discard(card: Card): void {
    this.player.discard(card);
  }

  drop(event: CdkDragDrop<Card[]>): void {
    if (event.previousContainer !== event.container) {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    this.player.sort();
    this.cd.detectChanges();
  }

  onDragStarted($event: CdkDragStart<Card>): void {
    this.dragStarted.next($event.source.data);
    this.dragging = true;
    this.cd.detectChanges();
  }

  onDragEnded($event: CdkDragDrop<Card>): void {
    this.dragEnded.next($event.item.data);
    this.dragging = false;
    this.cd.detectChanges();
  }

  allowDrop(meld: Meld): (drag: CdkDrag, drop: CdkDropList) => boolean {
    return (_drag: CdkDrag, _drop: CdkDropList) => meld.highlighted || meld.empty;
  }
}
