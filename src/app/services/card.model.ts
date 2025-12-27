import { computed, Signal, signal } from "@angular/core";
import { Suites } from "./suites";

export const DECK_FACES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function getCardIdx(card: Card): number {
    const idx = DECK_FACES.findIndex(c => c === card.face);
    if (idx === -1) {
        throw new Error(`Card out of range ${card.id}`);
    }
    return idx;
}

export function getPoints(card: Card): number {
    switch (card.face) {
        case 'A': return 1;
        case 'J':
        case 'Q':
        case 'K':
            return 10;
        default: return Number(card.face);
    }
}

export function getColor(card: Card): string {
    switch (card.suite) {
        case Suites.CLUBS:
        case Suites.SPADES:
            return 'black'
    }
    return 'red'
}

export class Card {
    highlighted: boolean = false;
    id: string;
    points: number;
    color: string;

    constructor(public face: string, public suite: Suites) {
        this.id = `${this.face}${this.suite}`;
        this.points = getPoints(this);
        this.color = getColor(this);
    }
}

export class PickedCard {
    constructor(public card: Card, public discardable: boolean) { }
}

export enum MeldType {
    SEQUENCE = 0,
    GROUP = 10,
    MIX = 20,
    EMPTY = 30,
}

export class Meld {
    private static _id = 1;
    id: number = Meld._id++;

    highlighted: boolean = false;

    cards = signal<Card[]>([]);

    isEmpty: Signal<boolean> = computed(() => this.type() === MeldType.EMPTY);

    type: Signal<MeldType> = computed(() => {
        const cards = this.cards();
        if (cards.length === 0) {
            return MeldType.EMPTY
        }

        const suites = new Set(cards.map(c => c.suite))
        const faces = new Set(cards.map(c => c.face))
        if (suites.size === 1 && faces.size > 1) {
            return MeldType.SEQUENCE
        }
        if (suites.size > 1 && faces.size === 1) {
            return MeldType.GROUP;
        }

        return MeldType.MIX;
    })

    suite: Signal<Suites | null> = computed(() => {
        const type = this.type();
        const cards = this.cards();
        return type === MeldType.SEQUENCE ? cards[0].suite : null;
    })

    isDeadwood: Signal<boolean> = computed(() => {
        const type = this.type();
        const cards = this.cards();
        if (type === MeldType.EMPTY) {
            return false;
        }
        if (cards.length <= 2 || type === MeldType.MIX) {
            return true;
        }

        if (type === MeldType.SEQUENCE) {
            const indicies = cards.map(c => DECK_FACES.findIndex(f => f === c.face));
            indicies.sort((a, b) => a - b);
            for (let i = 0; i < indicies.length - 1; i++) {
                if (indicies[i] + 1 !== indicies[i + 1]) {
                    return true;
                }
            }
        }
        return false;
    })

    points: Signal<number> = computed(() => this.cards().reduce<number>((sum, card) => sum + card.points, 0))

    constructor(cards: Card[]) {
        this.cards.set(cards);
    }

    addCard(card: Card): void {
        card.highlighted = true;
        this.cards.update(cards => [...cards, card]);
        this.sort();
    }

    remove(card: Card): boolean {
        const idx = this.cards().findIndex(c => c == card);
        if (idx != -1) {
            this.cards().splice(idx, 1);
            this.cards.update(cards => [...cards])
            return true;
        }
        return false;
    }

    sort(): void {
        this.cards().sort((a, b) => {
            const aIdx = getCardIdx(a);
            const bIdx = getCardIdx(b);
            return aIdx - bIdx
        })
    }

    toString(): any {
        const type = MeldType[this.type()];
        return `${this.id}-${type}: ${this.cards().map(c => c.id).join(',')}`;
    }
}
