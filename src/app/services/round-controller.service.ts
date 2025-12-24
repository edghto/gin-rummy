import { Injectable, OnDestroy } from "@angular/core";
import { PlayerController } from "./player-controller.service";
import { Card, PickedCard } from "./card.model";
import { filter, merge, Observable, Subscription } from "rxjs";
import { Dealer } from "./dealer.service";

enum Phase {
    DRAW,
    DISCARD,
}

@Injectable()
export class RoundController implements OnDestroy {
    private phase: Phase = Phase.DRAW;
    private players: PlayerController[] = [];
    private dealer!: Dealer;
    private subscriptions = new Subscription();

    get inDrawPhase(): boolean {
        return this.phase === Phase.DRAW;
    }

    private get currentPlayer(): PlayerController {
        return this.players[0];
    }

    public ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    init(dealer: Dealer, players: PlayerController[]): void {
        this.players = players;
        this.dealer = dealer;

        this.subscriptions.add(
            merge(...players.map(this.toPausable()))
                .pipe(filter(_any => this.phase === Phase.DISCARD))
                .subscribe(this.onCardDiscarded.bind(this))
        );

        this.subscriptions.add(
            dealer.cardPicked()
                .pipe(filter(_any => this.phase === Phase.DRAW))
                .subscribe(this.onCardPicked.bind(this))
        );
        this.subscriptions.add(dealer.stockEnded().subscribe(this.stockEnded.bind(this)));

        this.phase = Phase.DRAW;
    }

    private toPausable(): (p: PlayerController) => Observable<Card> {
        return (p: PlayerController) => {
            return p.cardDiscarded().pipe(filter(_any => p.name == this.currentPlayer.name))
        };
    }

    private pickedCard: PickedCard | undefined;
    private onCardPicked(pickedCard: PickedCard): void {
        this.phase = Phase.DISCARD;
        this.pickedCard = pickedCard;
        this.currentPlayer.addCard(pickedCard)
    }

    private onCardDiscarded(card: Card): void {
        if (this.pickedCard?.card == card && !this.pickedCard.discardable) {
            throw new Error('Card cannot be discarded');
        }
        this.pickedCard = undefined;
        this.currentPlayer.remove(card)
        this.dealer.discard(card);
        this.endRound();
    }

    private endRound(): void {
        const tmp = this.players.shift() as PlayerController;
        this.players.push(tmp);

        this.phase = Phase.DRAW;
        this.assertPlayers();
    }

    private stockEnded(): void {
        throw new Error('Not yetimplemented');
    }

    private assertPlayers(): void {
        const invalid = this.players.filter(p => p.totalCards != 10);
        if (invalid.length != 0) {
            throw new Error(`Too many cards ${invalid.map(p => p.name)}`);
        }
    }
}