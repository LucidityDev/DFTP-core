import { gql } from "apollo-boost";

// See more example queries on https://thegraph.com/explorer/subgraph/paulrberg/create-eth-app
// follow steps for local testing: https://thegraph.com/docs/quick-start#local-development
// cd graph-node/docker after git clone, then after docker up, $ graph init --from-example andrewhong5297/Lucidity-Funder-Tracker
// after yarn codegen:
// yarn create-local
// $ yarn deploy-local
// if you get errors, run docker-compose down --volume or rd /s /q "data/postgres"
export const GET_FUNDERS = gql`
query projects($projectName : String!) {
  projects(where: {name: $projectName}) {
    id
    name
    fundingTokens(first: 10) {
      id
      owner
      fundingvalue
      tenor
    }
    projectAddress
    ownerAddress
    bidderAddress
    auditorAddress 
  }
}
`;

export const GET_BIDS = gql`
query projects($projectName : String!) {
  projects(where: {name: $projectName}) {
    id
    name
    allBids (first: 10) {
      id
      bidderAddress
      bidDate
      timelines
      budgets
    }
    projectAddress
    ownerAddress
    originalTimelines
    originalBudgets
    milestones
  }
}
`;