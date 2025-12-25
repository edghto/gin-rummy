import { Observable, Subject } from "rxjs";
import { Card, DECK_FACES, Meld, MeldType, PickedCard } from "./card.model";
import { SUITES, Suites } from "./suites";

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
        return this.melds.filter(m => m.isDeadwood).reduce<Card[]>((acc, cur) => [...acc, ...cur.cards], [])
    }

    get totalCards(): number {
        return this.melds.reduce((acc, meld) => acc + meld.cards.length, 0)
    }

    constructor(public name: string, hand: Card[]) {
        const melds = new Map([
            [Suites.CLUBS, new Meld()],
            [Suites.SPADES, new Meld()],
            [Suites.DIAMONDS, new Meld()],
            [Suites.HEARTS, new Meld()],
        ]);
        hand.forEach(card => {
            const meld = melds.get(card.suite);
            if (meld) {
                meld.addCard(card)
            }
        })
        melds.forEach(m => m.sort());
        SUITES.map(s => melds.get(s))
            .filter(m => m?.type  !== MeldType.EMPTY)
            .forEach(m => this.melds.push(m as Meld));
    }

    addCard(pickedCard: PickedCard): void {
        const meld = this.melds.find(m => m.type === MeldType.EMPTY) ?? new Meld();
        meld.addCard(pickedCard.card)
        this.melds.push(meld);
    }

    remove(card: Card) {
        this.melds.forEach(meld => {
            const idx = meld.cards.findIndex(c => c == card);
            if (idx != -1) {
                meld.cards.splice(idx, 1);
            }
        });
    }

    discard(card: Card): void {
        this.cardDiscarded$.next(card);
    }

    orderCards() {
        this.melds.forEach(m => m.sort());
        this.melds.sort((a, b) => {
            const aIdx = SUITES.findIndex(card => card === a.suite);
            const bIdx = SUITES.findIndex(card => card === b.suite);
            return aIdx - bIdx
        })
    }

    knock(): void {

    }

    declare(): void {

    }
}
