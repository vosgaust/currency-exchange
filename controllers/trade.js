/* Gets the current conversion rate between two currencies
 * Receives sellCurrency and buyCurrency
 * Returns the current conversion rate
 */
const list = async function(req, res) {
  if(!req.query || !req.query.page || !req.query.elementsPerPage) {
    return res.sendStatus(400);
  }
  let result;
  try {
    const offset = (req.query.page - 1) * req.query.elementsPerPage;
    result = await req.tradesRepository.listTrades(offset, req.query.elementsPerPage);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).send();
  }
};

/* Adds a new trade to database. Receives
 * sellCurrency - The currency the user wants to sell
 * sellValue - The value the user wants to sell
 * buyCurrency - The currency the user wants to buy
 * changeRate - The change rate the user got from the server
 */
const add = async function(req, res) {
  const hasEmptyBody = Object.entries(req.body).length === 0 && req.body.constructor === Object;
  if(!req.body
     || req.headers['content-type'] !== 'application/json'
     || hasEmptyBody
     || !req.body.sellCurrency
     || !req.body.sellAmount
     || !req.body.buyCurrency
     || !req.body.changeRate) {
    return res.sendStatus(400);
  }
  try {
    const currentRate = await req.exchangeRatesService.getExchangeRate(req.body.sellCurrency, req.body.buyCurrency);
    const sellAmount = parseFloat(req.body.sellAmount);
    const rate = parseFloat(req.body.changeRate);
    if(rate !== currentRate) {
      return res.status(400).send({ status: 'error', msg: 'The exchange rate has changed' });
    }
    await req.tradesRepository.addTrade(req.body.sellCurrency,
      req.body.sellAmount,
      req.body.buyCurrency,
      sellAmount * rate,
      req.body.changeRate);
    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    return res.status(400).send({ status: 'error', msg: err });
  }
};

module.exports = {
  list,
  add
};
