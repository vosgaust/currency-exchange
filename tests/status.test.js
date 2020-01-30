const request = require('supertest');
const app = require('../app');

const baseEndpoint = '/api/status';

jest.mock('pg', () => {
  const client = {
    connect: jest.fn((callback) => callback()),
    query: jest.fn(),
    end: jest.fn()
  };
  return { Client: jest.fn(() => client) };
});

describe('Status endpoint', () => {
  it('Returns code 200', async () => {
    const res = await request(app).get(baseEndpoint);
    expect(res.statusCode).toBe(200);
  });
});

describe('Fallback endpoint', () => {
  it('Returns code 400 if the endpoint or method is not found', async () => {
    const res = await request(app).get('/fakeendpoint');
    expect(res.statusCode).toBe(404);
  });
});
