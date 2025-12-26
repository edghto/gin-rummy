import { Card, getCardIdx, Meld, MeldType } from "./card.model";
import { PlayerController } from "./player-controller.service";

export class HintService {
    constructor(private playerController: PlayerController) { }

    hintMeld(card: Card): Meld[] {
        const sequences = this.sequenceMatch(this.playerController.melds.filter(m => m.suite === card.suite), card);
        const groups = this.playerController.melds.filter(this.groupMatch(card));
        const mixed = this.playerController.melds.filter(m => m.type === MeldType.MIX);

        return [...sequences, ...groups, ...mixed].sort((a, b) => a.id - b.id);
    }

    private groupMatch(card: Card): (meld: Meld) => boolean {
        return (meld: Meld) => {
            return meld.cards.map(c => c.face).includes(card.face);
        }
    }

    private sequenceMatch(melds: Meld[], card: Card): Meld[] {
        if (melds.length <= 1) {
            return melds;
        }

        for (let i = 0; i < melds.length; i++) {
            if (this.inRange(melds[i], card)) {
                return [melds[i]];
            }
        }

        return melds;
    }

    private inRange(meld: Meld, card: Card): boolean {
        if (meld.cards.length === 0) {
            return false;
        }

        const lowerIdx = getCardIdx(meld.cards[0]);
        const upperIdx = getCardIdx(meld.cards[meld.cards.length - 1]);
        const cardIdx = getCardIdx(card);
        return lowerIdx > cardIdx && upperIdx < cardIdx;
    }
}
