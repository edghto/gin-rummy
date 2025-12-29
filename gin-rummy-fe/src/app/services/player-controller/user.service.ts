import { Card, Meld, MeldType, PickedCard } from "../card.model";
import { SUITES } from "../suites";
import { HintService } from "../hint.service";
import { PlayerController } from "./player-controller.service";

export class UserPlayerController extends PlayerController {
    private hintService = new HintService(this);

    constructor(hand: Card[]) {
        super("player", hand);
        this.hintService = new HintService(this);
    }

    override hints(card: Card): Meld[] {
        return this.hintService.hintMeld(card);
    }

    addCard(pickedCard: PickedCard): void {
        this.melds.update(melds => {
            let meld = melds.find(m => m.type() === MeldType.EMPTY);
            if (!meld) {
                meld = new Meld([]);
                melds = [...melds, meld];
            }
            meld.addCard(pickedCard.card)
            return melds;
        })
    }

}

