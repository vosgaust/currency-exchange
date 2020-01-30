const request = require('supertest');
const fetch = require('node-fetch');
const Postgres = require('pg').Client;
const app = require('../../../app');

const baseEndpoint = '/api/trade';

jest.mock('pg', () => {
  const client = {
    connect: jest.fn((callback) => callback()),
    query: jest.fn(),
    end: jest.fn()
  };
  return { Client: jest.fn(() => client) };
});

jest.mock('node-fetch', () => jest.fn());

describe('Get trades from database', () => {
  const path = 'list';
  let client;
  beforeEach(() => {
    client = new Postgres();
  });
  it('Returns code 200 if able to get data from the database', async () => {
    client.query.mockResolvedValueOnce({ rows: [{ count: 5 }] });
    client.query.mockResolvedValueOnce({ rows: [{ testRow: 'test' }] });
    const res = await request(app).get(`${baseEndpoint}/${path}?page=1&elementsPerPage=10`).send();
    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(5);
    expect(res.body.result).toEqual([{ testRow: 'test' }]);
  });

  it('Returns code 400 if query failed', async () => {
    client.query.mockRejectedValueOnce();
    const res = await request(app).get(`${baseEndpoint}/${path}?page=1&elementsPerPage=10`).send();
    expect(res.statusCode).toBe(400);
  });

  it('Returns code 400 if page number not present in query', async () => {
    const res = await request(app).get(`${baseEndpoint}/${path}?elementsPerPage=10`).send();
    expect(res.statusCode).toBe(400);
  });

  it('Returns code 400 if elements per page not present in query', async () => {
    const res = await request(app).get(`${baseEndpoint}/${path}?page=1`).send();
    expect(res.statusCode).toBe(400);
  });
});

describe('Add a new trade to database', () => {
  const path = 'add';
  const basePayload = {
    sellCurrency: 'EUR',
    buyCurrency: 'USD',
    sellAmount: 5.5,
    changeRate: 1.2
  };
  let client;
  beforeEach(() => {
    client = new Postgres();
  });
  it('Returns code 200 if properly added to database', async () => {
    const fetchResponse = { rates: { USD: 1.2 } };
    fetch.mockResolvedValueOnce({ json: () => fetchResponse });
    client.query.mockResolvedValueOnce({});
    const res = await request(app).post(`${baseEndpoint}/${path}`)
    .set('Content-type', 'application/json').send(basePayload);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('Returns code 400 if exchange rate has changed', async () => {
    const fetchResponse = { rates: { USD: 1.1 } };
    fetch.mockResolvedValueOnce({ json: () => fetchResponse });
    client.query.mockResolvedValueOnce({});
    const res = await request(app).post(`${baseEndpoint}/${path}`)
    .set('Content-type', 'application/json').send(basePayload);
    expect(res.statusCode).toBe(400);
  });

  it('Returns code 400 if sellCurrency not present in body', async () => {
    const newPayload = { ...basePayload };
    delete newPayload.sellCurrency;
    const res = await request(app).post(`${baseEndpoint}/${path}`)
    .set('Content-type', 'application/json').send();
    expect(res.statusCode).toBe(400);
  });

  it('Returns code 400 if sellAmount not present in body', async () => {
    const newPayload = { ...basePayload };
    delete newPayload.sellAmount;
    const res = await request(app).get(`${baseEndpoint}/${path}`)
    .set('Content-type', 'application/json').send();
    expect(res.statusCode).toBe(400);
  });

  it('Returns code 400 if buyCurrency not present in body', async () => {
    const newPayload = { ...basePayload };
    delete newPayload.buyCurrency;
    const res = await request(app).post(`${baseEndpoint}/${path}`)
    .set('Content-type', 'application/json').send();
    expect(res.statusCode).toBe(400);
  });

  it('Returns code 400 if change rate not present in body', async () => {
    const newPayload = { ...basePayload };
    delete newPayload.changeRate;
    const res = await request(app).get(`${baseEndpoint}/${path}`)
    .set('Content-type', 'application/json').send();
    expect(res.statusCode).toBe(400);
  });

  it('Returns code 400 if query failed', async () => {
    const fetchResponse = { rates: { USD: 1.1 } };
    fetch.mockResolvedValueOnce({ json: () => fetchResponse });
    client.query.mockRejectedValueOnce();
    const res = await request(app).get(`${baseEndpoint}/${path}`)
    .set('Content-type', 'application/json').send();
    expect(res.statusCode).toBe(400);
  });
});
