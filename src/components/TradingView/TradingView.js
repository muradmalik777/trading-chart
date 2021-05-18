import {useEffect} from "react";
import "./TradingView.scss";
import useAllSymbols from "../../hooks/useAllSymbols";
import {Box, CircularProgress} from "@material-ui/core";
import {createWidgetOptions} from "../../services/tradingViewOptions";


const TradingView = () => {
    const symbols = useAllSymbols();
    const loading = !symbols.length;
    const symbol = "Binance:BTC/USDT";

    const bootstrapWidget = () => {
        if(!loading && window.TradingView){
            const widgetOptions = createWidgetOptions(symbol, symbols);
            new window.TradingView.widget(widgetOptions);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(bootstrapWidget, [loading, window.TradingView])

    return (
        <Box className="widgetContainer" display="flex" flexDirection="row" justifyContent="center" alignItems="center">
            {loading ?
                <CircularProgress color="primary" size={50} />
                :
                <div className="tradingViewChart" id="trading_view_chart" />
            }
        </Box>
    )
}
export default TradingView