import { compareMarkets } from "../utils/format";
export const marketService = { compare: (data, cropId, quantity) => compareMarkets(data, cropId, quantity) };
