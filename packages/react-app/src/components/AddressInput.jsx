import React, { useState, useCallback } from "react";
import QrReader from "react-qr-reader";
import { CameraOutlined, QrcodeOutlined } from "@ant-design/icons";
import { Input, Badge } from "antd";
import { useLookupAddress } from "eth-hooks";
import Blockie from "./Blockie";

const AddressInput = ({
  value,
  ensProvider,
  placeholder,
  onChange,
  autoFocus
}) => {
  const [val, setValue] = useState(value);
  const [scan, setScan] = useState(false);

  const currentValue = typeof value !== "undefined" ? value : val;
  const ens = useLookupAddress(ensProvider, currentValue);

  const scannerButton = (
    <div
      style={{ marginTop: 4, cursor: "pointer" }}
      onClick={() => {
        setScan(!scan);
      }}
    >
      <Badge count={<CameraOutlined style={{ fontSize: 9 }} />}>
        <QrcodeOutlined style={{ fontSize: 18 }} />
      </Badge>{" "}
      Scan
    </div>
  );

  const updateAddress = useCallback(
    async newValue => {
      if (typeof newValue !== "undefined") {
        let address = newValue;
        if (address.indexOf(".eth") > 0 || address.indexOf(".xyz") > 0) {
          try {
            const possibleAddress = await ensProvider.resolveName(address);
            if (possibleAddress) {
              address = possibleAddress;
            }
            // eslint-disable-next-line no-empty
          } catch (e) { }
        }
        setValue(address);
        if (typeof onChange === "function") {
          onChange(address);
        }
      }
    },
    [ensProvider, onChange],
  );

  const scanner = scan ? (
    <div
      style={{
        zIndex: 256,
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
      }}
      onClick={() => {
        setScan(false);
      }}
    >
      <QrReader
        delay={250}
        resolution={1200}
        onError={e => {
          console.log("SCAN ERROR", e);
          setScan(false);
        }}
        onScan={newValue => {
          if (newValue) {
            console.log("SCAN VALUE", newValue);
            let possibleNewValue = newValue;
            if (possibleNewValue.indexOf("/") >= 0) {
              possibleNewValue = possibleNewValue.substr(possibleNewValue.lastIndexOf("0x"));
              console.log("CLEANED VALUE", possibleNewValue);
            }
            setScan(false);
            updateAddress(possibleNewValue);
          }
        }}
        style={{ width: "100%" }}
      />
    </div>
  ) : (
      ""
    );

  return (
    <div>
      {scanner}
      <Input
        id={"0xAddress"}//name it something other than address for auto fill doxxing
        name={"0xAddress"}//name it something other than address for auto fill doxxing
        autoFocus={autoFocus}
        placeholder={placeholder ? placeholder : "address"}
        prefix={<Blockie address={currentValue} size={8} scale={3} />}
        value={ens || currentValue}
        addonAfter={scannerButton}
        onChange={e => {
          updateAddress(e.target.value);
        }}
      />
    </div>
  );
}

export default AddressInput