import Datafeed from "./datafeed";

export function createWidgetOptions(symbol, allSymbols) {
    const feed = new Datafeed(allSymbols);
    
    return {
        symbol: symbol, // default symbol
        interval: '1D', // default interval
        fullscreen: true, // displays the chart in the fullscreen mode
        container_id: 'trading_view_chart',
        datafeed: feed,
        library_path: "/charting_library/charting_library/",
    };
  }

  export const configurationData = {
    supported_resolutions: ['1D', '1W', '1M'],
    exchanges: [
        {
            value: 'Binance',
            name: 'Binance',
            desc: 'Binance',
        },
    ],
    symbols_types: [
        {
            name: 'crypto',
            value: 'crypto',
        }
    ],
};