const fetch = require('node-fetch');

/* Service that connects to exchangeratesapi.io to retrieve exchange rates data */
class ExchangeRatesService {
  constructor() {
    this.apiURL = 'https://api.exchangeratesapi.io';
  }

  /* Gets the current exchange rate between two currencies
   * @param {string} sellCurrency - Currency code to sell (in ISO 4217 format)
   * @param {string} buyCurrency - Currency code to buy (in ISO 4217 format)
   * @return {float} - The exchange rate between those two currencies
   */
  async getExchangeRate(sellCurrency, buyCurrency) {
    const endpoint = 'latest';
    const response = await fetch(`${this.apiURL}/${endpoint}?base=${sellCurrency}&symbols=${buyCurrency}`);
    const json = await response.json();
    if(!json.error) {
      return parseFloat(json.rates[buyCurrency].toFixed(4));
    }
    return null;
  }

  /* Gets a list of available currencies to be converted
   * @return {array} - Array containing a list of available currencies (in ISO 4217 format)
   */
  async getAvailableCurrencies() {
    const endpoint = 'latest';
    try {
      const response = await fetch(`${this.apiURL}/${endpoint}`);
      const json = await response.json();
      if(!json.error) {
        return Object.keys(json.rates).concat(json.base);
      }
      return [];
    } catch (err) {
      return [];
    }
  }
}


module.exports = ExchangeRatesService;
