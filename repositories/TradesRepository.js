class TradesRepository {
  /* @param {object} pgClient - a postgresql client ready to use
   * @param {string} tableName - the table name for this repository */
  constructor(pgClient, tableName) {
    this.client = pgClient;
    this.tableName = tableName;
    this.columns = ['sell_currency', 'sell_amount', 'buy_currency', 'buy_amount', 'rate', 'date_booked'];
  }

  /* Inserts a new trade into database
   * @param {string} sellCurrency - currency code to sell
   * @param {float} sellAmount - amount to sell
   * @param {string} buyCurrency - currency code to buy
   * @param {float} sellAmount - amount to buy
   * @param {float} rate - exchange rate at which the conversion was made
   * @return {object} - result of the operation
   * */
  async addTrade(sellCurrency, sellAmount, buyCurrency, buyAmount, rate) {
    const date = (new Date()).toISOString();
    const query = `INSERT INTO ${this.tableName} (${this.columns.join(', ')}) `
                  + `VALUES ('${sellCurrency}', ${sellAmount}, '${buyCurrency}', ${buyAmount}, ${rate}, '${date}');`;
    const result = await this.client.query(query);
    return result;
  }

  /* Gets the historical trades stored in the database
   * @param {integer} offset - The page trying to get
   * @param {integer} elementsPerPage - elements to retrieve form database
   * @return {object} - object containing:
   *                    result(array): list of elements for that page
   *                    total(integer): total count of the table
   */
  async listTrades(offset, elementsPerPage) {
    const countResult = await this.client.query(`SELECT COUNT(*) FROM ${this.tableName};`);
    const totalElements = countResult.rows[0].count;
    const result = await this.client.query(`SELECT * FROM ${this.tableName} `
    + `ORDER BY date_booked DESC limit ${elementsPerPage} offset ${offset};`);
    return { total: totalElements, result: result.rows };
  }
}

module.exports = TradesRepository;
