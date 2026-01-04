import { Observable, Subject } from "rxjs";
import { Card, Meld, PickedCard } from "../card.model";
import { SUITES, Suites } from "../suites";
import { computed, Signal, signal } from "@angular/core";

export abstract class PlayerController {
    constructor(public name: string, hand: Card[]) {
        const melds = new Map<Suites, Card[]>([
            [Suites.CLUBS, []],
            [Suites.SPADES, []],
            [Suites.DIAMONDS, []],
            [Suites.HEARTS, []],
        ]);
        hand.forEach(card => {
            const meld = melds.get(card.suite);
            if (meld) {
                meld.push(card)
            }
        })
        this.melds.set(
            SUITES.map(s => melds.get(s))
                .filter(m => m?.length !== 0)
                .map(m => new Meld(m as Card[]))
        );
        this.sort();
    }

    melds = signal<Meld[]>([]);

    protected cardDiscarded$ = new Subject<Card>();
    cardDiscarded(): Observable<Card> {
        return this.cardDiscarded$.asObservable();
    }

    canDeclare: Signal<boolean> = computed(() => this.deadwoods().length == 0)
    deadWoodPoints: Signal<number> = computed(() => this.deadwoods().reduce((acc, m) => acc + m.points(), 0))
    deadwoods: Signal<Meld[]> = computed(() => this.melds().filter(m => m.isDeadwood()))
    totalCards: Signal<number> = computed(() => this.melds().reduce((acc, meld) => acc + meld.cards().length, 0))

    hints(_card: Card): Meld[] {
        return this.melds();
    }

    roundStart(): void { }

    abstract addCard(pickedCard: PickedCard): void;

    remove(card: Card): void {
        this.melds.update(melds => {
            melds.forEach(meld => meld.remove(card));
            return [...melds];
        });
    }

    discard(card: Card): void {
        this.cardDiscarded$.next(card);
        this.melds().forEach(m => {
            m.highlighted = false;
            m.cards().forEach(c => c.highlighted = false);
        });
    }

    sort(): void {
        this.melds.update(melds => {
            const max = SUITES.length;
            melds.forEach(m => m.sort());
            melds.sort((a, b) => {
                const aIdx = a.suite ? SUITES.findIndex(card => card === a.suite()) : max;
                const bIdx = b.suite ? SUITES.findIndex(card => card === b.suite()) : max;
                return aIdx - bIdx
            }).sort((a, b) => a.type() - b.type());

            /*
             * We need a placeholder at the end, to be able to take away a card from medl.
             * We delete more than one placeholder. But It may not be any, so first we add one at the end. 
             */
            melds.push(new Meld([]));

            const firstEmptyIdx = melds.findIndex(m => m.isEmpty());
            if (firstEmptyIdx < melds.length) {
                melds.splice(firstEmptyIdx + 1, melds.length);
            }

            return [...melds];
        });
    }
}
