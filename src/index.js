import React from "react";
import { render } from "react-dom";
import Input from "./Input";

class App extends React.Component {
  state = {
    rate: 0,
    transactions: {
      sell: [],
      buy: [],
      json:{},
      bitcoins: 0
    }
  };
  componentDidMount() {
    const result = JSON.parse(localStorage.getItem("stateJSON") || "{}");
    const {
      state: { rate = 0, transactions: { buy = [], sell = [] } = {}, bitcoins = 0} = {}
    } = result;
    fetch("https://api.zebpay.com/api/v1/ticker?currencyCode=INR")
    .then(r=>r.json())
    .then(json=>this.setState({json}));
    this.setState({
      rate,
      transactions: { buy, sell },
      bitcoins
    });
  }

  onChangeHandler = operation => newValue => {
    const {
      rate: previousRate,
      transactions: { buy: previousBuy, sell: previousSell } = {},
      bitcoins: previousBitcoins
    } = this.state;
    //console.log('previousBuy', previousBuy);
    let rate = previousRate;
    let buy = previousBuy || [];
    let bitcoins = previousBitcoins || 0;
    let sell = previousSell || [];

    switch (operation) {
      case "ADD":
        buy = previousBuy.concat(+newValue);
        break;
      case "SUBTRACT":
        sell = previousSell.concat(+newValue);
        break;
      case "RATE":
        rate = +newValue;
        break;
      case "BITCOINS":
        bitcoins = +newValue;
        break;
      case "CLEAR":
        buy = [];
        sell = [];
        rate = 0;
    }

    this.setState({ rate, transactions: { buy, sell }, bitcoins });
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
    let { rate, transactions = {}, json={}, bitcoins } = this.state;
    const {
      onChangeHandlerDeposit,
      onChangeHandlerSell,
      onChangeHandlerRate,
      onChangeHandlerClear,
      onChangeHandlerSave,
      onChangeTransactions,
      onChangeHandlerBitcoins
    } = this;
    const { sell = [], buy = [] } = transactions;
    const total =
      buy.reduce((a, b) => a + b, 0) - sell.reduce((a, b) => a + b, 0);

    return (
      <div>
        <div>
          <label htmlFor="deposit">Buy: </label>
          <Input
            id="deposit"
            onChange={onChangeHandlerDeposit}
            defaultValue={0}
          />
        </div>
        <div>
          <label htmlFor="sell">Sell: </label>
          <Input id="sell" onChange={onChangeHandlerSell} defaultValue={0} />
        </div>
        <div>
          <label htmlFor="rate">Current Sell Rate: </label>
          <Input id="rate" onChange={onChangeHandlerRate} defaultValue={0} />
        </div>
        <div>
          <label htmlFor="bitcoins">Current Bitcoins: </label>
          <Input id="bitcoins" onChange={onChangeHandlerBitcoins} defaultValue={0} />
        </div>
        <div>
          <button onClick={onChangeHandlerClear}>Clear </button>
        </div>
        <h2>Net Buy: {total}</h2>
        <h2>Current Sell Rate: {json.sell}</h2>
        <h2>Current Buy Rate: {json.buy}</h2>
        <h2>Net Sell: {bitcoins * json.sell}</h2>
        <h2>Net Profit: {(bitcoins*json.sell) - total}</h2>
        <h2>Total Bitcoins: {bitcoins}</h2>
        
        <button onClick={onChangeHandlerSave}>Store Results </button>

        <div>
          Buy Transaction:{" "}
          {transactions.buy &&
            transactions.buy.map((e, k) => <div key={k}>{e}</div>)}
          Sell Transaction:{" "}
          {transactions.sell &&
            transactions.sell.map((e, k) => <div key={k}>{e}</div>)}
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));

