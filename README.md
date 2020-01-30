[![Build Status](https://travis-ci.org/vosgaust/currency-exchange.svg?branch=master)](https://travis-ci.org/vosgaust/currency-exchange)
# currency-exchange
### How to run it
You can deploy the application using `docker-compose`. First you need to pull the images:

```
docker-compose pull
```

This command will download three images: nginx, postgresql (from the official repositories) and vosgaust/currency exchange which is the one that this repository creates.
You could as well build the image for this repository and pull the rest:

```
docker-compose build
```

After this you can deploy the application by running:

```
docker-compose up
```

![](deploy.png?raw=true)

Once it is up you can access to the application if you go to http://localhost you should see something like the following:

![](app1.png?raw=true)

### Considerations
I've had to use https://exchangeratesapi.io/ to get the exchange rates because fixer.io doesn't provide a free membership that allows you to make conversions between currencies. The basic (free) membership only allows to see conversion rates from Euro to other currencies.

Exchangeratesapi is a free open source api and it doesn't require an API key to work. Because of this, please mind the use and try not to flood it as they may block the IP or the service may go down.

### Application architecture
For the frontend application I have used Vue.js and for the backend Node.js. The data is stored into a PostgreSQL database. Below is an overview of the main architecture:
![](architecture.png?raw=true)

There are 4 main endpoints:
* `POST` /api/trades/add - adds a new trade into the database
* `GET` /api/trades/list - retrieves all existing trades in the database
* `GET` /api/exchange/currencies - gets a list of the current available currencies
* `GET` /api/exchange/rate - gets the exchange rate between two currencies

These are served with express.js, the `trades` part is handled by the `trade.js` controller and the `exchange` one is handled by the `exchange.js` controller. These controllers make use of two important components:
* TradesRepository - Helper to store and retrieve data from the database
* ExchangeRatesService - Handles the connection and requests to the external exchange rates API
These components are completely decoupled from the main application and they could be replaced to use another database or a differente exchange rate service.