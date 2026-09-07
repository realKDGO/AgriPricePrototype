export const marketRepository = {
  active(data) {
    return data.markets.filter((market) => market.status === "Active");
  },
  byId(data, marketId) {
    return this.active(data).find((market) => market.id === marketId);
  },
  currentPrices(data, cropId) {
    const activeCropIds = new Set(
      data.crops.filter((crop) => crop.status === "Active").map((crop) => crop.id),
    );
    const activeMarketIds = new Set(this.active(data).map((market) => market.id));
    const latest = new Map();
    data.prices
      .filter((record) => record.status === "Verified" && activeCropIds.has(record.cropId) && activeMarketIds.has(record.marketId) && (!cropId || record.cropId === cropId))
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((record) => latest.set(`${record.cropId}:${record.marketId}`, record));
    return [...latest.values()];
  },
  historical(data, cropIds, marketId = "all") {
    const activeMarketIds = new Set(this.active(data).map((market) => market.id));
    return data.history.filter((record) => activeMarketIds.has(record.marketId) && cropIds.includes(record.cropId) && (marketId === "all" || record.marketId === marketId));
  },
};
