import {parseFullSymbol} from "../utils/helpers";

const socketURL = "wss://streamer.cryptocompare.com/v2?api_key=ed56bc86b8680a0896f22cc99aa336531b3016da0c6d0512891caa7f4b253928";
const socket = new WebSocket(socketURL);
socket.onmessage = (message) => handleMessage(JSON.parse(message.data));

const channelSubscription = new Map();

const handleMessage = (message) => {
    switch(message.TYPE){
        case "0":
            updateBars(message)
            break;
        default:
            break;
    }
}

const updateBars = (data) => {
    console.log('[socket] Message:', data);
        const exchange = data.M;
        const fromSymbol = data.FSYM;
        const toSymbol = data.TSYM;
        const tradeTimeStr = data.TS;
        const tradePriceStr = data.P;

    const tradePrice = parseFloat(tradePriceStr);
    const tradeTime = parseInt(tradeTimeStr);
    const channelString = `0~${exchange}~${fromSymbol}~${toSymbol}`;
    const subscriptionItem = channelSubscription.get(channelString);
    if (subscriptionItem === undefined) {
        return;
    }
    const lastDailyBar = subscriptionItem.lastDailyBar;
    const nextDailyBarTime = getNextDailyBarTime(lastDailyBar.time);

    let bar;
    if (tradeTime >= nextDailyBarTime) {
        bar = {
            time: nextDailyBarTime,
            open: tradePrice,
            high: tradePrice,
            low: tradePrice,
            close: tradePrice,
        };
        console.log('[socket] Generate new bar', bar);
    } else {
        bar = {
            ...lastDailyBar,
            high: Math.max(lastDailyBar.high, tradePrice),
            low: Math.min(lastDailyBar.low, tradePrice),
            close: tradePrice,
        };
        console.log('[socket] Update the latest bar by price', tradePrice);
    }

    subscriptionItem.lastDailyBar = bar;
    console.log('[socket] Update the latest bar by price', tradePrice);
    subscriptionItem.handlers.forEach(handler => handler.callback(bar));
}

function getNextDailyBarTime(barTime) {
    const date = new Date(barTime * 1000);
    date.setDate(date.getDate() + 1);
    return date.getTime() / 1000;
}

export const subscribeFromStream = (symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback, lastDailyBar) => {
    const parsedSymbol = parseFullSymbol(symbolInfo.full_name);
    const channelString = `0~${parsedSymbol.exchange}~${parsedSymbol.fromSymbol}~${parsedSymbol.toSymbol}`;
    const handler = {
        id: subscribeUID,
        callback: onRealtimeCallback,
    };
    let subscriptionItem = channelSubscription.get(channelString);
    if (subscriptionItem) {
        subscriptionItem.handlers.push(handler);
        return;
    }
    subscriptionItem = {
        subscribeUID,
        resolution,
        lastDailyBar,
        handlers: [handler],
    };
    channelSubscription.set(channelString, subscriptionItem);
    console.log('[subscribeBars]: Subscribe to streaming. Channel:', channelString);
    socket.send(JSON.stringify({action:'SubAdd', subs: [channelString] }));
}

export const unsubscribeFromStream = (subscriberUID) => {
    for (const channelString of channelSubscription.keys()) {
        const subscriptionItem = channelSubscription.get(channelString);
        const handlerIndex = subscriptionItem.handlers.findIndex(handler => handler.id === subscriberUID);

        if (handlerIndex !== -1) {
            subscriptionItem.handlers.splice(handlerIndex, 1);

            if (subscriptionItem.handlers.length === 0) {
                console.log('[unsubscribeBars]: Unsubscribe from streaming. Channel:', channelString);
                socket.send(JSON.stringify({action: 'SubRemove', subs: [channelString] }));
                channelSubscription.delete(channelString);
                break;
            }
        }
    }
}