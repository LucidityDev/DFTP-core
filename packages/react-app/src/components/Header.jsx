import React from "react";
import { PageHeader } from "antd";
import { Flex } from "rimble-ui";
import styled from 'styled-components';

const StyledHeader = styled(Flex)`
  border-bottom: 1px solid #d6d6d6;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.01);
`;

const Header = ({ children }) => {
  return (
    <StyledHeader justifyContent="space-between">
      <a href="/">
        <PageHeader
          title="Lucidity"
          subTitle="Decentralized Transparency Fund Projects Platform"
          style={{ cursor: "pointer" }}
        />
      </a>
      {children}
    </StyledHeader>
  );
}

export default Header;