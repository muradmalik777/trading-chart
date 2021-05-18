import {configurationData} from "./tradingViewOptions";
import {makeApiRequest} from "../services/api";
import {parseFullSymbol} from "../utils/helpers";
import {subscribeFromStream, unsubscribeFromStream} from "./stream";

class Datafeed {
    constructor(symbols) {
        this.symbols = symbols ? symbols : [];
        this.lastBarsCache = new Map();
        this.channelSubscription = new Map();
        console.log("Datafeed constructor called and symbols initialzed")
    }

    onReady (callback) {
        console.log('[onReady]: Method call');
        setTimeout(() => callback(configurationData));
    }

    async searchSymbols (userInput, exchange, symbolType, onResultReadyCallback) {
        console.log('[searchSymbols]: Method call');
        const newSymbols = this.symbols.filter(symbol => {
            const isExchangeValid = exchange === '' || symbol.exchange === exchange;
            const isFullSymbolContainsInput = symbol.full_name.toLowerCase().includes(userInput.toLowerCase());
            return isExchangeValid && isFullSymbolContainsInput;
        });
        onResultReadyCallback(newSymbols);
    }

    async resolveSymbol (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
        console.log('[resolveSymbol]: Method call', symbolName);
        const symbolItem = this.symbols.find(({ full_name }) => full_name.includes(symbolName));
        
        if (!symbolItem) {
            console.log('[resolveSymbol]: Cannot resolve symbol', symbolName);
            onResolveErrorCallback('cannot resolve symbol');
            return;
        }

        const symbolInfo = {
            ticker: symbolItem.full_name,
            name: symbolItem.symbol,
            description: symbolItem.description,
            type: symbolItem.type,
            session: '24x7',
            timezone: 'Etc/UTC',
            exchange: symbolItem.exchange,
            minmov: 1,
            pricescale: 100,
            has_intraday: false,
            has_no_volume: true,
            has_weekly_and_monthly: false,
            supported_resolutions: configurationData.supported_resolutions,
            volume_precision: 2,
            data_status: 'streaming',
        };

        console.log('[resolveSymbol]: Symbol resolved', symbolName);
        onSymbolResolvedCallback(symbolInfo);
    }

    async getBars (symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) {
        const parsedSymbol = parseFullSymbol(symbolInfo.full_name);
        const urlParameters = {
            e: parsedSymbol.exchange,
            fsym: parsedSymbol.fromSymbol,
            tsym: parsedSymbol.toSymbol,
            toTs: to,
            limit: 2000,
        };
        const query = new URLSearchParams(urlParameters);
        try {
            const data = await makeApiRequest(`data/histoday?${query}`);
            if ((data.Response && data.Response === 'Error') || data.Data.length === 0) {
                onHistoryCallback([], { noData: true });
                return;
            }
            let bars = [];
            data.Data.forEach(bar => {
                if (bar.time >= from && bar.time < to) {
                    bars = [...bars, {
                        time: bar.time * 1000,
                        low: bar.low,
                        high: bar.high,
                        open: bar.open,
                        close: bar.close,
                    }];
                }
            });
            if (firstDataRequest) {
                this.lastBarsCache.set(symbolInfo.full_name, { ...bars[bars.length - 1] });
            }
            onHistoryCallback(bars, { noData: false });
        } catch (error) {
            console.log('[getBars]: Get error', error);
            onErrorCallback(error);
        }
    }

    subscribeBars (symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback) {
        console.log('[subscribeBars]: Method call with subscribeUID:', subscribeUID);
        subscribeFromStream(
            symbolInfo,
            resolution,
            onRealtimeCallback,
            subscribeUID,
            onResetCacheNeededCallback,
            this.lastBarsCache.get(symbolInfo.full_name)
        );
    }

    unsubscribeBars (subscriberUID) {
        console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
        unsubscribeFromStream(subscriberUID);
    }


};

export default Datafeed;