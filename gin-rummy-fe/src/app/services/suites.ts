
export enum Suites {
    SPADES = "♠",
    HEARTS = "♥",
    DIAMONDS = "♦",
    CLUBS = "♣"
}

export enum SuitesColor {
    SPADES = "black",
    HEARTS = "red",
    DIAMONDS = "red",
    CLUBS = "blac",
}

export const SUITES = [Suites.CLUBS, Suites.SPADES, Suites.DIAMONDS, Suites.HEARTS];

export function fromString(value: string): Suites | null {
    return (Object.values(Suites) as Array<string>).includes(value) ? (value as Suites) : null;
}
