const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Postgres = require('pg').Client;
const exchangeController = require('./controllers/exchange');
const tradeController = require('./controllers/trade');
const ExchangeRatesService = require('./services/ExchangeRates');
const TradesRepository = require('./repositories/TradesRepository');

const postgres = new Postgres({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USER || 'user',
  database: process.env.POSTGRES_DB || 'currency_exchange',
  password: process.env.POSTGRES_PASSWORD || 'user'
});
postgres.connect((err) => {
  if(err) {
    console.error('Connection error', err.stack);
    process.exit(1);
  } else {
    console.log('Connected to database');
  }
});

const app = express();
const router = express.Router();
app.use(cors());
const exchangeRatesService = new ExchangeRatesService();

const tableName = process.env.TRADES_TABLE_NAME || 'trades';

const tradesRepository = new TradesRepository(postgres, tableName);
const _injectDependency = function (name, dependency) {
  return (req, res, next) => {
    req[name] = dependency;
    next();
  };
};

router.get('/status', (req, res) => {
  res.status(200).send();
});

router.get('/trade/list',
  _injectDependency('tradesRepository', tradesRepository),
  tradeController.list);

router.post('/trade/add', bodyParser.json(),
  _injectDependency('exchangeRatesService', exchangeRatesService),
  _injectDependency('tradesRepository', tradesRepository),
  tradeController.add);

router.get('/exchange/currencies',
  _injectDependency('exchangeRatesService', exchangeRatesService),
  exchangeController.getCurrencies);

router.get('/exchange/rate',
  _injectDependency('exchangeRatesService', exchangeRatesService),
  exchangeController.getExchangeRate);


router.use((req, res) => {
  res.sendStatus(400);
});

app.use('/api', router);

module.exports = app;
