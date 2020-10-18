import styled from "styled-components";

export { default as Account } from "./Account";
export { default as Contract } from "./Contract";
export { default as Address } from "./Address";
export { default as AddressInput } from "./AddressInput";
export { default as EtherInput } from "./EtherInput";
export { default as Balance } from "./Balance";
export { default as TokenBalance } from "./TokenBalance";
export { default as Provider } from "./Provider";
export { default as Ramp } from "./Ramp";
export { default as Faucet } from "./Faucet";
export { default as Wallet } from "./Wallet";
export { default as Blockie } from "./Blockie";
export { default as Header } from "./Header";
export { default as Timeline } from "./Timeline";
export { default as GasGauge } from "./GasGauge";
export { default as Projects } from "./Projects";


export const Body = styled.body`
  align-items: center;
  background-color: #282c34;
  color: white;
  display: flex;
  flex-direction: column;
  font-size: calc(10px + 2vmin);
  justify-content: center;
  min-height: calc(100vh - 70px);
`;

export const Image = styled.img`
  height: 40vmin;
  margin-bottom: 16px;
  pointer-events: none;
`;

export const Link = styled.a.attrs({
  target: "_blank",
  rel: "noopener noreferrer",
})`
  color: #61dafb;
  margin-top: 10px;
`;

export const Button = styled.button`
  background-color: white;
  border: none;
  border-radius: 8px;
  color: #282c34;
  cursor: pointer;
  font-size: 16px;
  text-align: center;
  text-decoration: none;
  margin: 0px 20px;
  padding: 12px 24px;

  ${props => props.hidden && "hidden"}
  
  :focus {
    border: none;
    outline: none;
  }
`;