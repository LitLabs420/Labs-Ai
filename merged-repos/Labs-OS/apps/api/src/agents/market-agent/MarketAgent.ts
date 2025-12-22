import { ensureStream, ensureConsumer, getStreamName, getDurableName } from "../../lib/natsBus";
import { ensureStream, subscribeDurable } from "../../lib/natsBus";
import { MarketEvents } from "../../economy/marketplace/types/events";
import { settleTrade } from "../../economy/marketplace/services/tradeService";

export async function startMarketAgent() {
  try {
  const stream = process.env.NATS_STREAM || "LABSOS";
  const durableBase = process.env.NATS_CONSUMER || "market-agent";

  await ensureStream(stream, ["Market.>"]);

  await subscribeDurable({
    subject: MarketEvents.Trade.Escrowed,
    durable: `${durableBase}-escrowed`,
    queue: "market-agents",
    ackWaitMs: 30_000,
    handler: async (evt) => {
      await settleTrade(evt.tradeId);
    },
  });
  } catch (e) {
    console.error("BOOT_AGENT_ERROR", e);
  }
}