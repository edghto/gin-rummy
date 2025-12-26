import { Suites } from "./suites";

export const DECK_FACES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function getCardIdx(card: Card): number {
    const idx = DECK_FACES.findIndex(c => c === card.face);
    if (idx === -1) {
        throw new Error(`Card out of range ${card.id}`);
    }
    return idx;
}

export class Card {
    highlighted: boolean = false;

    get id(): string {
        return `${this.face}${this.suite}`;
    }
    get color(): string {
        switch (this.suite) {
            case Suites.CLUBS:
            case Suites.SPADES:
                return 'black'
        }
        return 'red'
    }

    get point(): number {
        switch (this.face) {
            case 'A': return 1;
            case 'J':
            case 'Q':
            case 'K':
                return 10;
            default: return Number(this.face);
        }
    }

    constructor(public face: string, public suite: Suites) { }
}


export class PickedCard {
    constructor(public card: Card, public discardable: boolean) { }
}

export enum MeldType {
    SEQUENCE,
    GROUP,
    EMPTY,
}


export class Meld {
    private static _id = 1;
    id: number = Meld._id++;

    highlighted: boolean = false;

    cards: Card[] = [];

    get empty(): boolean {
        return this.type === MeldType.EMPTY;
    }

    get type(): MeldType {
        const suites = new Set(...this.cards.map(c => c.suite))
        if (suites.size === 1 && this.cards.length > 1) {
            return MeldType.SEQUENCE
        } else if (suites.size > 1) {
            return MeldType.GROUP;
        }

        return MeldType.EMPTY
    }

    get suite(): Suites | null {
        return this.type === MeldType.SEQUENCE ? this.cards[0].suite : null;
    }

    get isDeadwood(): boolean {
        if (this.cards.length <= 2) {
            return true;
        }
        if (this.type === MeldType.SEQUENCE) {
            const indicies = this.cards.map(c => DECK_FACES.findIndex(f => f === c.face));
            for (let i = 0; i < indicies.length - 1; i++) {
                if (indicies[i] !== indicies[i + 1]) {
                    return false;
                }
            }
        }
        else if (this.type === MeldType.GROUP) {
            const faces = new Set(...this.cards.map(c => c.face));
            return faces.size === 1;
        }

        return true;
    }


    addCard(card: Card) {
        card.highlighted = true;
        this.cards.push(card);
        this.sort();
    }

    sort(): void {
        this.cards.sort((a, b) => {
            const aIdx = getCardIdx(a);
            const bIdx = getCardIdx(b);
            return aIdx - bIdx
        })
    }
}
