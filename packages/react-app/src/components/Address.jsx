import React, { useEffect, useState } from "react";
import Blockies from "react-blockies";
import styled from "styled-components";
import { Typography, Skeleton } from "antd";
import { Text, Box, Flex } from "rimble-ui";
import { useLookupAddress } from "eth-hooks";


const StyledAddress = styled.a`
  color: #222 !important;
  font-size: 16px;
  text-decoration: none;
`;

/*

  Displays an address with a blockie, links to a block explorer, and can resolve ENS

  <Address
    value={address}
    ensProvider={mainnetProvider}
    blockExplorer={optional_blockExplorer}
    fontSize={optional_fontSize}
  />

*/

const { Text: TextAnt } = Typography;

const blockExplorerLink = (address, blockExplorer) => `${blockExplorer || "https://etherscan.io/"}${"address/"}${address}`;

const Address = ({
  ensProvider,
  value,
  size,
  blockExplorer,
  minimized,
  onChange,
  fontSize
}) => {
  const ens = useLookupAddress(ensProvider, value);
  const [address, setAddress] = useState(null);

  // set address depending on size
  useEffect(() => {
    if (ens) {
      setAddress(ens);
    } else if (size === "short") {
      setAddress(`${value.substr(0, 6)}...${value.substr(-4)}`);
    } else if (size === "long") {
      setAddress(value);
    } else {
      setAddress(value.substr(0, 6));
    }
  }, [value, ens, size])

  if (!value) {
    return (
      <span>
        <Skeleton avatar paragraph={{ rows: 1 }} />
      </span>
    );
  }

  const etherscanLink = blockExplorerLink(value, blockExplorer);
  if (minimized) {
    return (
      <span style={{ verticalAlign: "middle" }}>
        <a style={{ color: "#222222" }} target="_blank" rel="noopener noreferrer" href={etherscanLink}>
          <Blockies seed={value.toLowerCase()} size={8} scale={2} />
        </a>
      </span>
    );
  }

  const addressProps = {
    copyable: { text: value }
  }
  if (onChange) {
    addressProps.editable = { onChange }
  }

  return (
    <Flex alignItems="center" mr={4}>
      <Blockies seed={value.toLowerCase()} size={6} scale={fontSize ? fontSize / 7 : 4} />
      <Box style={{ padding: '0 4px' }}>
        <Text
          fontWeight={600}
          fontSize={"12px"}
          color={"#2B2C36"}
          lineHeight={1}
        >
          Connected as
        </Text>
        <TextAnt {...addressProps} >
          <StyledAddress target={"_blank"} href={etherscanLink}>
            {address}
          </StyledAddress>
        </TextAnt>
      </Box>
    </Flex>
  );
}

export default Address;