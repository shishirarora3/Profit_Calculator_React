import React from "react";

export default class Input extends React.Component {
  state = { value: undefined };
  componentWillReceiveProps({ value }) {
    this.setState({ value });
  }
  onChangeHandler = ({ target: { value } }) => {
    this.setState({
      value
    });
  };
  onEnter = e => {
    if (+e.keyCode === 13) {
      this.props.onChange(e.target.value);
    }
  };
  render() {
    const {
      state: { value },
      onChangeHandler,
      onEnter,
      props: { defaultValue }
    } = this;

    return (
      <input
        type="text"
        placeholder="enter amount"
        onKeyDown={onEnter}
        onChange={onChangeHandler}
        value={value}
      />
    );
  }
}
