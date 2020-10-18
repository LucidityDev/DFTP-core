import { gql } from "apollo-boost";

// See more example queries on https://thegraph.com/explorer/subgraph/paulrberg/create-eth-app
const GET_TRANSFERS = gql`
{
  fundingTokens(first: 5) {
    id
    fundingvalue
    tenor
  }
}
`;

export default GET_TRANSFERS;
