import { SimpleAdapter, FetchResult, ChainBlocks } from "../../adapters/types";

import fetchURL from "../../utils/fetchURL"
const {
  getUniqStartOfTodayTimestamp,
} = require("../../helpers/getUniSubgraphVolume");

interface BancorV2Response {
  data: Array<{
    timestamp: number
    bnt: string
    usd: string
    eur: string
    eth: string
  }>
}
const endpoints = {
  ethereum: (date: number) =>
    `https://api-v2.bancor.network/history/volume?interval=day&start_date=${date}`,
};

const graphs = (chain: string) =>
  async (timestamp: number, _chainBlocks: ChainBlocks): Promise<FetchResult> => {
    const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
    switch (chain) {
      case "ethereum":
        return fetchURL(endpoints.ethereum(dayTimestamp)).then((res: any) => res.data)
          .then(({ data }: BancorV2Response) => {
            const volume = data.find(item => (item.timestamp / 1000) === dayTimestamp)
            if (!volume) throw new Error(`Unexpected error: No volume found for ${dayTimestamp}`)
            return {
              timestamp: dayTimestamp,
              dailyVolume: volume.usd
            }
          })
      default:
        throw new Error(`No adapter found for ${chain}`)
    }
  }

const adapter: SimpleAdapter = {
  adapter: {
    ethereum: {
      fetch: graphs("ethereum"),
      runAtCurrTime: false,
      customBackfill: undefined,
      start: async () => 1570665600,
    },
    // CUSTOM BACKFILL
  },
};

export default adapter;
