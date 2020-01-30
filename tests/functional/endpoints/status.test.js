const request = require('supertest');
const app = require('../../../app');

const baseEndpoint = '/status';

describe('Status endpoint', () => {
  it('Returns code 200', async () => {
    const res = await request(app).get(baseEndpoint);
    expect(res.statusCode).toBe(200);
  });
});

describe('Fallback endpoint', () => {
  it('Returns code 400 if the endpoint or method is not found', async () => {
    const res = await request(app).get('/fakeendpoint');
    expect(res.statusCode).toBe(400);
  });
});
