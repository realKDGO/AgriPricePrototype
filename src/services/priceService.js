import { marketRepository } from "./marketRepository";
export const priceService = {
  current: (data, cropId) => marketRepository.currentPrices(data, cropId),
  historical: (data, cropId, marketId = "all") => marketRepository.historical(data, cropId ? [cropId] : data.crops.map((crop) => crop.id), marketId),
};
