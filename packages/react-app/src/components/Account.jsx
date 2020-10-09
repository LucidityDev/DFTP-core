import React from "react";
import { Button } from "antd";
import { Flex, Box, Text } from "rimble-ui";
import Address from "./Address";
import Balance from "./Balance";
import Wallet from "./Wallet"

export default function Account({
  address,
  userProvider,
  localProvider,
  mainnetProvider,
  price,
  minimized,
  web3Modal,
  loadWeb3Modal,
  logoutOfWeb3Modal,
  blockExplorer,
}) {
  const modalButtons = [];
  if (web3Modal) {
    if (web3Modal.cachedProvider) {
      modalButtons.push(
        <Button
          key="logoutbutton"
          style={{ verticalAlign: "top", marginLeft: 8, marginTop: 4 }}
          shape="round"
          size="large"
          onClick={logoutOfWeb3Modal}
        >
          logout
        </Button>,
      );
    } else {
      modalButtons.push(
        <Button
          key="loginbutton"
          style={{ verticalAlign: "top", marginLeft: 8, marginTop: 4 }}
          shape="round"
          size="large"
          type={minimized ? "default" : "primary"}
          onClick={loadWeb3Modal}
        >
          connect
        </Button>,
      );
    }
  }

  const display = minimized ? (
    ""
  ) : (
      <>
        {address ? <Address value={address} ensProvider={mainnetProvider} blockExplorer={blockExplorer} /> : "Connecting..."}
        <Flex alignItems="center">
          <Wallet address={address} provider={userProvider} ensProvider={mainnetProvider} price={price} />
          <Box>
            <Text
              fontWeight={600}
              fontSize={"12px"}
              color={"#2B2C36"}
              lineHeight={1}
            >
              Balance
            </Text>
            <Balance size={16} address={address} provider={localProvider} dollarMultiplier={price} />
          </Box>
        </Flex>
      </>
    );

  return (
    <Flex justifyContent={"space-between"} p={3}>
      {display}
      {modalButtons}
    </Flex>
  );
}
