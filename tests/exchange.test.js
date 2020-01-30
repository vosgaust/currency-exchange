const fetch = require('node-fetch');
const request = require('supertest');
const app = require('../app');
const currencyCodesResponse = require('./testData/currencyCodesResponse.json');

jest.mock('node-fetch', () => jest.fn());

const baseEndpoint = '/api/exchange';

jest.mock('pg', () => {
  const client = {
    connect: jest.fn((callback) => callback()),
    query: jest.fn(),
    end: jest.fn()
  };
  return { Client: jest.fn(() => client) };
});


describe('Get available currencies', () => {
  const path = 'currencies';
  it('Returns code 200 if able to get available currencies', async () => {
    const response = Promise.resolve({
      ok: true,
      status: 'ok',
      json: () => currencyCodesResponse,
    });
    fetch.mockImplementation(() => response);
    const res = await request(app).get(`${baseEndpoint}/${path}`).send();
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.result).toContain('EUR');
    expect(res.body.result).toContain('USD');
  });
});

describe('Get current exchange rate', () => {
  const path = 'rate';
  it('Returns code 200 if able to get the exchange rate', async () => {
    const returnBody = { rates: { EUR: 0.9086778737 }, base: 'USD', date: '2020-01-28' };
    const response = Promise.resolve({
      ok: true,
      status: 'ok',
      json: () => returnBody,
    });
    fetch.mockImplementationOnce(() => response);
    const res = await request(app).get(`${baseEndpoint}/${path}?sellCurrency=USD&buyCurrency=EUR`).send();
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.result).not.toBeNaN();
    expect(res.body.result).not.toBeNull();
  });

  it('Returns code 200 with error if currencies are not valid', async () => {
    const returnBody = { error: 'Symbols \'TTT\' are invalid for date 2020-01-28.' };
    const response = Promise.resolve({
      ok: true,
      status: 'ok',
      json: () => returnBody,
    });
    fetch.mockImplementation(() => response);
    const res = await request(app).get(`${baseEndpoint}/${path}?sellCurrency=EUR&buyCurrency=TTT`).send();
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('error');
    expect(res.body.msg).toBe('Bad input');
  });

  it('Returns code 400 if buyCurrency not present in query', async () => {
    const res = await request(app).get(`${baseEndpoint}/${path}?sellCurrency=EUR`).send();
    expect(res.statusCode).toBe(400);
  });

  it('Returns code 400 if sellCurrency not present in query', async () => {
    const res = await request(app).get(`${baseEndpoint}/${path}?buyCurrency=EUR`).send();
    expect(res.statusCode).toBe(400);
  });
});
