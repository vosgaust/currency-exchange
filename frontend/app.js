/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const ELEMENTS_PER_PAGE = 10;
const COLUMNS_NAMES = {
  sell_currency: 'Sell Currency',
  buy_amount: 'Buy Amount',
  buy_currency: 'Buy Currency',
  sell_amount: 'Sell Currency',
  rate: 'Rate',
  date_booked: 'Date Booked'
};
const API_URL = 'localhost/api';

const getPage = function(page) {
  return fetch(`http://${API_URL}/trade/list?page=${page}&elementsPerPage=${ELEMENTS_PER_PAGE}`)
  .then((response) => response.json())
  .then((json) => {
    json.result = json.result.map((trade) => {
      trade.date_booked = moment(trade.date_booked).format('DD/MM/YYYY HH:mm');
      return trade;
    });
    return json;
  })
  .then((json) => {
    this.trades = json.result;
    this.totalPages = Math.ceil(json.total / 10);
    return true;
  });
};

const getExchangeRate = function() {
  const sellCurrency = this.sellCurrency;
  const buyCurrency = this.buyCurrency;
  if(sellCurrency && buyCurrency) {
    fetch(`http://${API_URL}/exchange/rate?sellCurrency=${sellCurrency}&buyCurrency=${buyCurrency}`)
    .then((response) => response.json())
    .then((json) => {
      if(json.status === 'ok') {
        this.rate = json.result;
      } else {
        this.rate = 0;
      }
    });
  } else {
    this.rate = 0;
  }
};

const showAlert = function(elementID, type, message) {
  const classes = {
    success: 'alert-success',
    error: 'alert-danger'
  };
  const className = 'show-alert';
  const alert = document.querySelector(`#${elementID}`);
  this.alertMessage = message;
  if(alert) {
    alert.classList.add(className);
    alert.classList.add(classes[type]);
    setTimeout(() => {
      alert.classList.remove(className);
      alert.classList.remove(classes[type]);
    }, 2000);
  }
};

const app = new Vue({
  el: '#app',
  data: {
    alertMessage: '',
    trades: [],
    currentPage: 1,
    totalPages: 0,
    availableCurrencies: ['EUR', 'USD'],
    showNewTradeForm: false,
    buyCurrency: '',
    sellAmount: null,
    sellCurrency: '',
    rate: 0
  },
  computed: {
    columns: function() {
      if(this.trades.length === 0) {
        return [];
      }
      return Object.keys(this.trades[0]).filter((key) => key !== 'id');
    },
    columnsNames: function() {
      if(this.columns.length === 0) {
        return [];
      }
      return this.columns.map((name) => COLUMNS_NAMES[name] || name);
    },
    buyAmount: function() {
      if(this.rate) {
        return (this.sellAmount * this.rate).toFixed(2);
      }
      return 0;
    }
  },
  methods: {
    movePages: function(move) {
      const newPage = this.currentPage + move;
      if(newPage > 0 && newPage <= this.totalPages) {
        getPage.call(this, newPage)
        .then(() => {
          this.currentPage = newPage;
          return true;
        })
        .catch(console.error);
      }
    },
    showForm: function() {
      return fetch(`http://${API_URL}/exchange/currencies`)
      .then((response) => response.json())
      .then((json) => {
        if(json.status === 'ok') {
          this.availableCurrencies = json.result.sort();
          this.showNewTradeForm = !this.showNewTradeForm;
        }
      });
    },
    confirmTrade: function() {
      const payload = {
        sellCurrency: this.sellCurrency,
        buyCurrency: this.buyCurrency,
        sellAmount: this.sellAmount,
        buyAmount: this.buyAmount,
        changeRate: this.rate
      };
      return fetch(`http://${API_URL}/trade/add`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then((result) => result.json())
      .then((json) => {
        if(json.status === 'ok') {
          getPage.call(this, 1).catch(console.error);
          showAlert.call(this, 'alert-modal', 'success', 'Trade saved successfully');
        } else {
          showAlert.call(this, 'alert-modal', 'error', json.msg);
        }
      })
      .catch((err) => {
        showAlert.call(this, 'alert-modal', 'error', err);
      });
    }
  },
  watch: {
    sellCurrency: getExchangeRate,
    buyCurrency: getExchangeRate
  },
  created: function() {
    getPage.call(this, 1).catch(console.error);
  }
});
