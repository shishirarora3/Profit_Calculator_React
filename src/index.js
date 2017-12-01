import React from "react";
import { render } from "react-dom";
import Input from "./Input";

const getNetBuy = (buy = [], sell = []) =>
  buy.reduce((a, b) => a + b, 0) - sell.reduce((a, b) => a + b, 0);
const getNetProfit = (bitcoins, json, total) => {
  return bitcoins * json.sell - total;
};

class App extends React.Component {
  state = {
    rate: 0,
    transactions: {
      sell: [],
      buy: [],
      json: {},
      bitcoins: 0,
      profitChange: 0,
      total: 0
    }
  };
  componentDidMount() {
    const result = JSON.parse(localStorage.getItem("stateJSON") || "{}");
    const {
      state: {
        rate = 0,
        transactions: { buy = [], sell = [] } = {},
        bitcoins = 0
      } = {}
    } = result;
    fetch("https://api.zebpay.com/api/v1/ticker?currencyCode=INR")
      .then(r => r.json())
      .then(json => this.setState({ json }));
    this.setState({
      rate,
      transactions: { buy, sell },
      bitcoins,
      total: getNetBuy(buy, sell)
    });
  }

  onChangeHandler = operation => newValue => {
    const {
      rate: previousRate,
      transactions: { buy: previousBuy, sell: previousSell } = {},
      bitcoins: previousBitcoins,
      json = {},
      profitChange
    } = this.state;
    //console.log('previousBuy', previousBuy);
    let rate = previousRate;
    let buy = previousBuy || [];
    let bitcoins = previousBitcoins || 0;
    let sell = previousSell || [];
    let value = +newValue;
    let netProfitChange = 0;

    switch (operation) {
      case "ADD":
        buy = previousBuy.concat(value);
        bitcoins = previousBitcoins + value / json.buy;
        netProfitChange =
          (bitcoins - previousBitcoins) *
            getNetBuy(buy, sell) /
            previousBitcoins -
          value;
        break;
      case "SUBTRACT":
        sell = previousSell.concat(value);
        bitcoins = previousBitcoins - value / json.sell;
        netProfitChange =
          (bitcoins - previousBitcoins) *
            getNetBuy(buy, sell) /
            previousBitcoins +
          value;
        break;
      case "RATE":
        rate = value;
        break;
      case "BITCOINS":
        bitcoins = value;
        break;
      case "CLEAR":
        buy = [];
        sell = [];
        rate = 0;
    }
    const total = getNetBuy(buy, sell);

    this.setState({
      rate,
      transactions: { buy, sell },
      bitcoins,
      total,
      profitChange: netProfitChange
    });
  };

  onChangeHandlerDeposit = this.onChangeHandler("ADD");
  onChangeHandlerSell = this.onChangeHandler("SUBTRACT");
  onChangeHandlerRate = this.onChangeHandler("RATE");
  onChangeHandlerClear = this.onChangeHandler("CLEAR");
  onChangeTransactions = this.onChangeHandler("TRANSACTIONS");
  onChangeHandlerBitcoins = this.onChangeHandler("BITCOINS");
  onChangeHandlerSave = () => {
    const { state: { rate, transactions, bitcoins } } = this;
    localStorage.setItem(
      "stateJSON",
      JSON.stringify({ state: { rate, transactions, bitcoins } })
    );
  };

  render() {
    let {
      rate,
      transactions = {},
      json = {},
      bitcoins,
      profitChange,
      total
    } = this.state;
    const {
      onChangeHandlerDeposit,
      onChangeHandlerSell,
      onChangeHandlerClear,
      onChangeHandlerSave,
      onChangeHandlerBitcoins
    } = this;
    const { sell = [], buy = [] } = transactions;
    const netSell = bitcoins * json.sell;
    const netProfit = getNetProfit(bitcoins, json, total);

    return (
      <div>
        <div>
          <label htmlFor="deposit">Buys: </label>
          <Input
            id="deposit"
            onChange={onChangeHandlerDeposit}
            defaultValue={0}
          />
        </div>
        <div>
          <label htmlFor="sell">Sells: </label>
          <Input id="sell" onChange={onChangeHandlerSell} defaultValue={0} />
        </div>
        <div>
          <label htmlFor="bitcoins">Current Bitcoins: </label>
          <Input
            id="bitcoins"
            onChange={onChangeHandlerBitcoins}
            defaultValue={0}
          />
        </div>
        <div>
          <button onClick={onChangeHandlerClear}>Clear </button>
        </div>
        <h2>Net Buy: {total}</h2>
        <h2>Current Sell Rate: {json.sell}</h2>
        <h2>Current Buy Rate: {json.buy}</h2>
        <h2>Net Sell: {netSell}</h2>
        <h2>Net Profit: {netProfit}</h2>
        <h2>Total Bitcoins: {bitcoins}</h2>
        <h2>Profit Change: {profitChange}</h2>
        <button onClick={onChangeHandlerSave}>Store Results </button>

        <div>
          {buy && <h2>Buy Transaction:</h2>}

          {buy.map((e, k) => <div key={k}>{e}</div>)}
          {sell && <h2>Sell Transaction:</h2>}
          {sell && sell.map((e, k) => <div key={k}>{e}</div>)}
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
