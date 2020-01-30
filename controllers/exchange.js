/* Gets the current conversion rate between two currencies
 * Receives sellCurrency and buyCurrency
 * Returns the current conversion rate
 */
const getExchangeRate = async function(req, res) {
  if(!req.query || !req.query.sellCurrency || !req.query.buyCurrency) {
    return res.sendStatus(400);
  }
  const result = await req.exchangeRatesService.getExchangeRate(req.query.sellCurrency, req.query.buyCurrency);
  if(result) {
    return res.status(200).json({ status: 'ok', result: result });
  }
  return res.status(200).json({ status: 'error', msg: 'Bad input' });
};

/* Gets the supported currencies */
const getCurrencies = async function(req, res) {
  const result = await req.exchangeRatesService.getAvailableCurrencies();
  if(result && result.length !== 0) {
    return res.status(200).json({ status: 'ok', result: result });
  }
  return res.status(200).json({ status: 'error', msg: 'Bad input' });
};

module.exports = {
  getExchangeRate,
  getCurrencies
};
