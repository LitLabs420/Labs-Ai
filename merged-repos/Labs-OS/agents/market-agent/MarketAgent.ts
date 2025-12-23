import { subscribe } from "@/apps/api/src/lib/natsBus";
import { MarketEvents } from "@/economy/marketplace/types/events";
import { settleTrade } from "@/economy/marketplace/services/tradeService";

export async function startMarketAgent() {
  await subscribe(MarketEvents.Trade.Escrowed, async (evt) => {
    await settleTrade(evt.tradeId);
  });
}