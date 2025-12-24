import { Observable, Subject } from "rxjs";
import { Card, Meld, PickedCard } from "./card.model";

export class PlayerController {
    melds: Meld[] = [];

    private cardDiscarded$ = new Subject<Card>();
    cardDiscarded(): Observable<Card> {
        return this.cardDiscarded$.asObservable();
    }

    get canKnock(): boolean {
        return this.deadWoodPoints <= 10;
    }

    get canDeclare(): boolean {
        return this.deadwoods.length == 0;
    }

    get deadWoodPoints(): number {
        return this.deadwoods.reduce((acc, card) => acc + card.point, 0);
    }

    get deadwoods(): Card[] {
        return this.melds.reduce((acc, cur) => [...acc, ...cur], [])
    }

    get totalCards(): number {
        return this.melds.reduce((acc, meld) => acc + meld.length, 0)
    }

    constructor(public name: string, deadwoods: Card[]) {
        this.melds = deadwoods.map(card => [card]);
    }

    addCard(pickedCard: PickedCard): void {
        this.melds.push([pickedCard.card]);
    }

    remove(card: Card) {
        this.melds.forEach(meld => {
            const idx = meld.findIndex(c => c == card);
            if (idx != -1) {
                meld.splice(idx, 1);
            }
        });
    }

    discard(card: Card): void {
        this.cardDiscarded$.next(card);
    }

    knock(): void {

    }

    declare(): void {

    }
}