import { useState, useEffect } from "react";
import {makeApiRequest} from "../services/api";
import {configurationData} from "../services/tradingViewOptions";
import {generateSymbol} from "../utils/helpers";

const useAllSymbols = () => {
  const [symbols, setSymbols] = useState([]);

    const  getAllSymbols = () => {
        makeApiRequest('data/v3/all/exchanges').then((data) => {
            let allSymbols = [];
            for (const exchange of configurationData.exchanges) {
                const pairs = data.Data[exchange.value].pairs;

                for (const leftPairPart of Object.keys(pairs)) {
                    const symbols = pairs[leftPairPart].map(rightPairPart => {
                        const symbol = generateSymbol(exchange.value, leftPairPart, rightPairPart);
                        return {
                            symbol: symbol.short,
                            full_name: symbol.full,
                            description: symbol.short,
                            exchange: exchange.value,
                            type: 'crypto',
                        };
                    });
                    allSymbols = [...allSymbols, ...symbols];
                }
            }
            setSymbols(allSymbols);
        })
        .catch((e) => {
            console.log(e)
        })
    }

    useEffect(getAllSymbols, []);

  return symbols;
};

export default useAllSymbols;
