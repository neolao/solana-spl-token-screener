/**
 * Relative Strength Index (RSI)
 *
 * Standard setting: 14 period
 *
 * The RSI compares the average gain and the average loss and analyses
 * how many of the past 14 candles were bullish or bearish and also analyses the candle size of each candle.
 *
 * For example,
 * if all 14 price candles were bullish, the RSI would be 100 and if all 14 price candles were bearish,
 * the RSI would be 0 (or relatively close to 100 and 0).
 * And an RSI of 50 would mean that 7 past candles were bearish, 7 were bullish and the size of the average gain and loss was equal.
 *
 *
 * La formule classique du RSi est la suivante : RSI= 100 - [100/(1+H/B)]
 *
 * Avec
 * H qui est la moyenne des hausses pendant les X dernières Unités de Temps (UT).
 * B qui est la moyenne des baisses pendant les X dernières Unités de Temps (UT).
 * X= la valeur du RSI
 */
export default function relativeStrengthIndex(candlesticks) {
    const period = candlesticks.length;

    let h = 0;
    let b = 0;
    for (let index = 0; index < period; index++) {
        let candlestick = candlesticks[index];
        let close = candlestick.c;
        let open = candlestick.o;

        if (open < close) {
            h += close - open;
        } else {
            b += open - close;
        }
    }

    h = h / period;
    b = b / period;

    if (b === 0) {
        return 100;
    }

    return 100 - (100 / (1 + h / b));
}
