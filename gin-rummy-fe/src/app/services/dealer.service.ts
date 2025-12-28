import { NEVER, Observable, Subject } from "rxjs";
import { Card, DECK_FACES, PickedCard } from "./card.model";
import { SUITES, Suites } from "./suites";
import { signal, Signal } from "@angular/core";

export class Dealer {
    private stockPile: Card[] = [];
    private discardedPile: Card[] = [];
    private _lastDiscardedCard = signal<Card | null>(null);

    private _player = signal<Card[]>([]);
    private _opponent = signal<Card[]>([]);

    get player(): Signal<Card[]> {
        return this._player.asReadonly();
    }
    get opponent(): Signal<Card[]> {
        return this._opponent.asReadonly();
    }

    get lastDiscardedCard(): Signal<Card | null> {
        return this._lastDiscardedCard.asReadonly();
    }

    constructor() {
        this.stockPile = shuffle(DECK_FACES.flatMap(face => SUITES.map(suite => new Card(face, suite))));
        const player: Card[] = [];
        const opponent: Card[] = [];

        Array.from({ length: 10 }, (_x, _i) => {
            player.push(array_pop(this.stockPile));
            opponent.push(array_pop(this.stockPile));
        });

        this._player.set(player);
        this._opponent.set(opponent);

        this.discard(array_pop(this.stockPile));
    }

    private cardPicked$ = new Subject<PickedCard>();
    cardPicked(): Observable<PickedCard> {
        return this.cardPicked$.asObservable();
    }

    pickFromStock(): void {
        this.cardPicked$.next(new PickedCard(array_pop(this.stockPile), true));
    }

    pickFromDiscarded(): void {
        const last = array_pop(this.discardedPile)
        const newLast = this.discardedPile.length
            ? this.discardedPile[this.discardedPile.length - 1]
            : null;
        this._lastDiscardedCard.set(newLast)
        this.cardPicked$.next(new PickedCard(last, false));
    }

    discard(card: Card) {
        this.discardedPile.push(card);
        this._lastDiscardedCard.set(card);
    }

    stockEnded(): Observable<void> {
        return NEVER;
    }
}

function array_pop<T>(arr: T[]): T {
    if (arr?.length > 0) {
        return arr.pop() as T;
    }
    throw new Error('Cannot pop from empty array');
}

function shuffle<T>(inputList: T[]): T[] {
    const outputList = [];
    while (inputList.length > 0) {
        const idx = Math.floor(Math.random() * inputList.length);
        const selected = inputList.splice(idx, 1);
        outputList.push(selected[0])
    }
    return outputList;
}
