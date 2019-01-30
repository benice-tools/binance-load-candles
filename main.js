const Binance = require('binance-api-node').default;
const fs = require('fs');

const client = Binance();

const [,, symbol, daysFromNow, interval, path] = process.argv;

console.log({
  symbol,
  daysFromNow,
  interval,
  path
});

(async () => {
  let allCandles = [];

  const endTime = Date.now();

  let startTime = Date.now() - parseInt(daysFromNow) * 24 * 60 * 60 * 1000;

  const allTime = endTime - startTime;

  while (endTime > startTime) {
    const candles = await client.candles({
      symbol,
      startTime,
      endTime,
      limit: 1000,
      interval
    });

    startTime = candles[candles.length - 1].closeTime;

    allCandles = allCandles.concat(candles);

    console.log("Loaded ", Math.round((1 - ((endTime - startTime) / allTime)) * 100), "%");
  }

  console.log(
    "Historical data from ",
    new Date(allCandles[0].openTime),
    " to ",
    new Date(allCandles[allCandles.length - 1].closeTime),
    " successfully loaded!"
  );

  console.log("Writing to a file ", path);
  fs.writeFile(path, JSON.stringify(allCandles), 'utf8', (err) => {
    if (err) {
      console.error(err);
    }
  });
})();
