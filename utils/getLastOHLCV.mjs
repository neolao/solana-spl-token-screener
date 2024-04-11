import getHistoricalOHLCV from "./getHistoricalOHLCV.mjs";
import getYesterdayTime from "./getYesterdayTime.mjs";

export default function getLastOHLCV(baseAddress, targetAddress, dayCount) {
    const currentYear = (new Date()).getFullYear();
    const yesterdayTime = getYesterdayTime();

    const dayDuration = 86400; // seconds
    const oldestRequestedTime = yesterdayTime - dayDuration * dayCount;
    const oldestYear = new Date(oldestRequestedTime * 1000).getFullYear();

    const candlesticks = {};
    for (let year = oldestYear; year <= currentYear; year++) {
        Object.assign(candlesticks, getHistoricalOHLCV(baseAddress, targetAddress, year));
    }
    const result = [];
    for (let count = 0; count < dayCount; count++) {
        const requestedTime = yesterdayTime - dayDuration * count;
        if (candlesticks[requestedTime]) {
            result.unshift(candlesticks[requestedTime]);
        }
    }

    return result;
}
