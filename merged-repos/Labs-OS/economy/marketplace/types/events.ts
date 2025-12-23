export const MarketEvents = {
  Asset: {
    Created: "Market.Asset.Created",
    Fractionalized: "Market.Asset.Fractionalized",
    Listed: "Market.Asset.Listed",
  },
  Trade: {
    Requested: "Market.Trade.Requested",
    Escrowed: "Market.Trade.Escrowed",
    Settled: "Market.Trade.Settled",
    Failed: "Market.Trade.Failed",
  },
} as const;