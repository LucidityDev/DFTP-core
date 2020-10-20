import { gql } from "apollo-boost";

// See more example queries on https://thegraph.com/explorer/subgraph/paulrberg/create-eth-app
// follow steps for local testing: https://thegraph.com/docs/quick-start#local-development
// cd graph-node/docker after git clone, then after docker up, $ graph init --from-example andrewhong5297/Lucidity-Funder-Tracker
// after yarn codegen:
// yarn create-local
// $ yarn deploy-local
// if you get errors, run docker-compose down --volume or rd /s /q "data/postgres"
export const GET_FUNDERS = gql`
{
  fundingTokens(first: 5) {
    id
    fundingvalue
    tenor
  }
}
`;
