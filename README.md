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