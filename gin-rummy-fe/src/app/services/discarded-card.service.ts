import { InjectionToken } from "@angular/core";
import { Card } from "./card.model";

export const DISCADED_CARDS_SERVICE_TOKEN = new InjectionToken<DiscadedCardsService>('DiscadedCardsService');
export interface DiscadedCardsService {
    history(): Card[];
}