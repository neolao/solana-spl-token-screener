import getHistoricalOHLCV from "./getHistoricalOHLCV.mjs";
import getYesterdayTime from "./getYesterdayTime.mjs";

export default function getLastOHLCV(baseAddress, targetAddress, dayCount) {
    const year = (new Date()).getFullYear();
    const yesterdayTime = getYesterdayTime();

    // TODO get from previous year if necessary
    const candlesticks = getHistoricalOHLCV(baseAddress, targetAddress, year);
    const dayDuration = 86400; // seconds
    const result = [];
    for (let count = 0; count < dayCount; count++) {
        const requestedTime = yesterdayTime - dayDuration * count;
        if (candlesticks[requestedTime]) {
            result.unshift(candlesticks[requestedTime]);
        }
    }

    return result;
}
