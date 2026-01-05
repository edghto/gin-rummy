import { fromString, Suites } from "../suites"

export class Card {
    constructor(
        public suite: Suites,
        public face: string,
    ) { }

    static fromPayload(payload: any): Card {
        return new Card(
            fromString(payload.suite) as Suites,
            payload.face,
        )
    }

    get id(): string {
        return `${this.face}${this.suite}`;
    }
}

export class Meld {
    constructor(
        public id: number | null,
        public cards: Card[],
    ) { }

    static fromPayload(payload: any): Meld {
        return new Meld(
            payload.id,
            payload.cards.map(Card.fromPayload)
        )
    }
}

export class Request {
    constructor(
        public history: Card[],
        public melds: Meld[],
        public newCard: Card,
    ) { }
}

export class Response {
    constructor(
        public melds: Meld[],
        public discardedCard: Card,
        public newCard: Card,
    ) { }

    static fromPayload(payload: any): Response {
        return new Response(
            payload.melds.map(Meld.fromPayload),
            Card.fromPayload(payload.discardedCard),
            Card.fromPayload(payload.newCard),
        )
    }
}
