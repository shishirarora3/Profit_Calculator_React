import React from "react";
import { render } from "react-dom";
import Input from "./Input";

class App extends React.Component {
  state = {
    rate: 0,
    transactions: {
      sell: [],
      buy: []
    }
  };
  componentDidMount() {
    const result = JSON.parse(localStorage.getItem("stateJSON") || "{}");
    const {
      state: { rate = 0, transactions: { buy = [], sell = [] } = {} } = {}
    } = result;

    this.setState({
      rate,
      transactions: { buy, sell }
    });
  }

  onChangeHandler = operation => newValue => {
    const {
      rate: previousRate,
      transactions: { buy: previousBuy, sell: previousSell } = {}
    } = this.state;
    //console.log('previousBuy', previousBuy);
    let rate = previousRate;
    let buy = previousBuy || [];

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
      case "CLEAR":
        buy = [];
        sell = [];
        rate = 0;
    }

    this.setState({ rate, transactions: { buy, sell } });
  };

  onChangeHandlerDeposit = this.onChangeHandler("ADD");
  onChangeHandlerSell = this.onChangeHandler("SUBTRACT");
  onChangeHandlerRate = this.onChangeHandler("RATE");
  onChangeHandlerClear = this.onChangeHandler("CLEAR");
  onChangeTransactions = this.onChangeHandler("TRANSACTIONS");
  onChangeHandlerSave = () => {
    const { state: { rate, transactions } } = this;
    localStorage.setItem(
      "stateJSON",
      JSON.stringify({ state: { rate, transactions } })
    );
  };

  render() {
    let { rate, transactions = {} } = this.state;
    const {
      onChangeHandlerDeposit,
      onChangeHandlerSell,
      onChangeHandlerRate,
      onChangeHandlerClear,
      onChangeHandlerSave,
      onChangeTransactions
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
          <button onClick={onChangeHandlerClear}>Clear </button>
        </div>
        <h2>Net Buy: {total}</h2>
        <h2>Current Sell Rate: {rate}</h2>
        <h2>Net Profit: {rate - total}</h2>

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
