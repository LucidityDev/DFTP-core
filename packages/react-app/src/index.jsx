import React from "react";
import ReactDOM from "react-dom";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import "./index.css";
import App from "./App";

//our subgraph at https://github.com/andrewhong5297/Lucidity-Funder-Tracking
const client = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/andrewhong5297/lucidity-funder-tracking",
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root"),
);
