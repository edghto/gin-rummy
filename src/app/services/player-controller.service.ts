import { Observable, Subject } from "rxjs";
import { Card, Meld, MeldType, PickedCard } from "./card.model";
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
                card.highlighted = false;
            }
        })
        melds.forEach(m => m.sort());
        SUITES.map(s => melds.get(s))
            .filter(m => m?.type !== MeldType.EMPTY)
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

    sort(): void {
        const max = SUITES.length;
        this.melds.forEach(m => m.sort());
        this.melds.sort((a, b) => {
            const aIdx = a.suite ? SUITES.findIndex(card => card === a.suite) : max;
            const bIdx = b.suite ? SUITES.findIndex(card => card === b.suite) : max;
            return aIdx - bIdx
        });

        /*
         * We need a placeholder at the end, to be able to take away a card from medl.
         * We delete more than one placeholder. But It may not be any, so first we add one at the end. 
         */
        this.melds.push(new Meld());
        const firstEmpty = this.melds.findIndex(m => m.empty);
        if (firstEmpty < this.melds.length) {
            this.melds.splice(firstEmpty + 1, this.melds.length);
        }
    }

    knock(): void {

    }

    declare(): void {

    }
}

