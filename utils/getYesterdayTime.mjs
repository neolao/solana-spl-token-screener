export default function getYesterdayTime() {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    yesterday.setUTCHours(0);
    yesterday.setUTCMinutes(0);
    yesterday.setUTCSeconds(0);
    yesterday.setUTCMilliseconds(0);
    return Math.floor(yesterday.getTime() / 1000);
}
