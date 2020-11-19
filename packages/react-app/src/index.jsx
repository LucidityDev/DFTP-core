import React from "react";
import ReactDOM from "react-dom";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import "./index.css";
import App from "./App";

import 'react-dates/initialize';

//our subgraph at https://github.com/andrewhong5297/Lucidity-Funder-Tracking
const client = new ApolloClient({
  uri: "http://127.0.0.1:8000/subgraphs/name/andrewhong5297/Lucidity-Funder-Tracking" //"https://api.thegraph.com/subgraphs/name/andrewhong5297/lucidity-funder-tracking",
});

const client2 = new ApolloClient({
  uri: "http://127.0.0.1:8000/subgraphs/name/andrewhong5297/Lucidity-Neg-Tracking" //"https://api.thegraph.com/subgraphs/name/andrewhong5297/lucidity-funder-tracking",
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />,
  </ApolloProvider>,
  document.getElementById("root"),
);
