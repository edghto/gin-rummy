import { Suites } from "./suites";

export const DECK_FACES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export class Card {
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

export type Meld = Card[];
