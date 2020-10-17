import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

const Buttons = (props) => {
  const { register, handleSubmit } = useForm();

  const [text, _changeText] = useState([
    "haven't called yet, click call button",
  ]);

  const callAPI = () => {
    _changeText("called!")
  };

  return (
    <React.Fragment>
      {" "}
      {text}
      <button onclick = { callAPI }className="btn btn-danger btn-sm m-2">
        Approve Transaction
      </button>
      <button onclick = { callAPI } className="btn btn-danger btn-sm m-2">
        Fund Project
      </button>
      <form onSubmit={handleSubmit(onSubmitForm)}>
        <label>
          Ticker:
          <input type="text" name="ticker" ref={register} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </React.Fragment>
  );
};

export default Buttons;
