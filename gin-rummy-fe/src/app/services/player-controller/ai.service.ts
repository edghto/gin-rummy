import { map, Observable, of, Subscription, tap } from "rxjs";
import { Meld, Card, PickedCard } from "../card.model";
import { PlayerController } from "./player-controller.service";
import { HttpClient } from "@angular/common/http";
import { Request, Response, Card as HttpCard, Meld as HttpMeld } from "./ai.model";
import { Dealer } from "../dealer.service";

class RequestParams {
    constructor(
        public history: HttpCard[],
        public melds: HttpMeld[],
    ) { }

    toRequest(card: Card | HttpCard): Request {
        const newCard = card instanceof Card ? fromCard(card) : card;
        return new Request(this.history, this.melds, newCard);
    }
}

const AI_ENDPOINT = 'api/player/turn';

export class AIPlayerController extends PlayerController {

    private response: Response | null = null;

    private subscription = new Subscription();

    unsubscribe(): void {
        this.subscription.unsubscribe();
    }

    constructor(
        hand: Card[],
        private httpClient: HttpClient,
        private dealer: Dealer,
    ) {
        super("ai", hand);
    }

    override hints(_card: Card): Meld[] {
        return [];
    }

    override roundStart(): void {
        const request = this.getParams();
        const newCard = request.history.pop();

        if (newCard) {
            this.subscription.add(this.query(request.toRequest(newCard)).subscribe(response => {
                if (response.discardedCard == newCard) {
                    this.response = response;
                    this.dealer.pickFromDiscarded();
                }
                else {
                    this.dealer.pickFromStock();
                }
            }));
        } else {
            this.dealer.pickFromStock();
        }
    }

    addCard(pickedCard: PickedCard): void {
        const params = this.getParams();
        const o = !this.response || this.response.newCard != pickedCard.card
            ? this.query(params.toRequest(fromCard(pickedCard.card)))
            : of(this.response);
        this.response = null;
        this.subscription.add(o.pipe(this.onResponse.bind(this)).subscribe());
    }

    private onResponse(o: Observable<Response>): Observable<any> {
        return o.pipe(
            tap(this.uppdateMelds()),
            map(resposne => fromHttpCard(resposne.discardedCard)),
            tap(card => this.cardDiscarded$.next(card)));
    }

    private uppdateMelds(): (value: Response) => void {
        return response => {
            const melds = [
                ...response.melds.map(fromHttpMeld),
                new Meld([fromHttpCard(response.discardedCard)]),
            ];
            this.melds.set(melds);
        }
    }

    private getParams(): RequestParams {
        const history = this.dealer.history().map(fromCard);
        const melds = this.melds().map(m => new HttpMeld(m.id, m.cards().map(fromCard)))
        return new RequestParams(history, melds)
    }

    private query(request: Request): Observable<Response> {
        return this.httpClient.post(AI_ENDPOINT, request).pipe(map(Response.fromPayload));
    }
}

function fromCard(card: Card): HttpCard {
    return new HttpCard(card.suite, card.face);
}

function fromHttpCard(card: HttpCard): Card {
    return new Card(card.face, card.suite);
}

function fromHttpMeld(meld: HttpMeld): Meld {
    return new Meld(meld.cards.map(fromHttpCard));
}