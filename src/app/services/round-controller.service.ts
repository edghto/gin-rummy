import { Injectable, OnDestroy } from "@angular/core";
import { PlayerController } from "./player-controller.service";
import { Card, PickedCard } from "./card.model";
import { filter, merge, MonoTypeOperatorFunction, Observable, Subscription } from "rxjs";
import { Dealer } from "./dealer.service";

export enum Phase {
    DRAW,
    DISCARD,
    END,
}

@Injectable()
export class RoundController implements OnDestroy {
    private _phase: Phase = Phase.DRAW;
    private players: PlayerController[] = [];
    private dealer!: Dealer;
    private subscriptions = new Subscription();

    get phase(): Phase {
        return this._phase;
    }
    set phase(value: Phase) {
        this._phase = value;
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
            merge(...players.map(this.toPausable(PlayerController.prototype.cardDiscarded)))
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

    onDragStarted(card: Card): void {
        card.highlighted = false;
        this.currentPlayer.hints(card).forEach(m => m.highlighted = true);
    }

    onDragEnded(_card: Card): void {
        this.currentPlayer.melds().forEach(m => m.highlighted = false);
    }

    private toPausable<T>(func: () => Observable<T>): (p: PlayerController) => Observable<T> {
        return (p: PlayerController) => {
            return func.call(p).pipe(filter(_any => p.name == this.currentPlayer.name))
        };
    }

    private pickedCard: PickedCard | undefined;
    private onCardPicked(pickedCard: PickedCard): void {
        if (pickedCard.card) {
            this.phase = Phase.DISCARD;
            this.pickedCard = pickedCard;
            this.currentPlayer.addCard(pickedCard)
        }
        else {
            this.endGame(true);
        }
    }

    private onCardDiscarded(card: Card): void {
        if (this.pickedCard?.card == card && !this.pickedCard.discardable) {
            throw new Error('Card cannot be discarded');
        }
        this.pickedCard = undefined;
        this.currentPlayer.remove(card)

        const last = this.currentPlayer.canDeclare();
        if (last) {
            this.endGame(false);
        }
        else {
            this.endRound(card);
        }
    }

    private endRound(card: Card): void {
        this.dealer.discard(card);
        const tmp = this.players.shift() as PlayerController;
        this.players.push(tmp);
        this.phase = Phase.DRAW;
        this.assertPlayers();
    }

    private endGame(draw: boolean): void {
        this.phase = Phase.END;
        this.players.splice(0);
    }

    private stockEnded(): void {
        throw new Error('Not yetimplemented');
    }

    private assertPlayers(): void {
        const invalid = this.players.filter(p => p.totalCards() != 10);
        if (invalid.length != 0) {
            throw new Error(`Worng cards count ${invalid.map(p => p.name)}`);
        }
    }
}