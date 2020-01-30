const fetch = require('node-fetch');
const ExchangeRatesService = require('../services/ExchangeRates');
const currencyCodesResponse = require('./testData/currencyCodesResponse.json');

jest.mock('node-fetch', () => jest.fn());
const exchangeRates = new ExchangeRatesService();


describe('Get an exchange rate', () => {
  it('Should get an exchange rate', async () => {
    const returnBody = { rates: { EUR: 0.9086778737 }, base: 'USD', date: '2020-01-28' };
    const response = Promise.resolve({
      ok: true,
      status: 'ok',
      json: () => returnBody,
    });
    fetch.mockImplementation(() => response);
    const result = await exchangeRates.getExchangeRate('USD', 'EUR');
    expect(result).toBe(parseFloat(returnBody.rates.EUR.toFixed(4)));
  });

  it('Should return null if currency codes are not valid', async () => {
    const returnBody = { error: 'Symbols \'TTT\' are invalid for date 2020-01-28.' };
    const response = Promise.resolve({
      ok: true,
      status: 'ok',
      json: () => returnBody,
    });
    fetch.mockImplementation(() => response);
    const result = await exchangeRates.getExchangeRate('EUR', 'TTT');
    expect(result).toBeNull();
  });
});

describe('Get available currencies', () => {
  it('Should get all available currencies at the moment', async () => {
    const response = Promise.resolve({
      ok: true,
      status: 'ok',
      json: () => currencyCodesResponse,
    });
    fetch.mockImplementation(() => response);
    const result = await exchangeRates.getAvailableCurrencies();
    expect(result).toEqual(Object.keys(currencyCodesResponse.rates).concat(currencyCodesResponse.base));
  });

  it('Should return empty array if there is an error in code', async () => {
    fetch.mockImplementation(() => Promise.reject());
    const result = await exchangeRates.getAvailableCurrencies();
    expect(result).toEqual([]);
  });

  it('Should return empty array if there is an error in request', async () => {
    const returnBody = { error: true };
    const response = Promise.resolve({
      ok: true,
      status: 'ok',
      json: () => returnBody,
    });
    fetch.mockImplementation(() => response);
    const result = await exchangeRates.getAvailableCurrencies();
    expect(result).toEqual([]);
  });
});
