// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class NewProject extends ethereum.Event {
  get params(): NewProject__Params {
    return new NewProject__Params(this);
  }
}

export class NewProject__Params {
  _event: NewProject;

  constructor(event: NewProject) {
    this._event = event;
  }

  get name(): string {
    return this._event.parameters[0].value.toString();
  }

  get baseURI(): string {
    return this._event.parameters[1].value.toString();
  }

  get project(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get owner(): Address {
    return this._event.parameters[3].value.toAddress();
  }

  get bidder(): Address {
    return this._event.parameters[4].value.toAddress();
  }

  get auditor(): Address {
    return this._event.parameters[5].value.toAddress();
  }
}

export class TokenFactory__getProjectResult {
  value0: Address;
  value1: string;
  value2: string;
  value3: string;

  constructor(value0: Address, value1: string, value2: string, value3: string) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromAddress(this.value0));
    map.set("value1", ethereum.Value.fromString(this.value1));
    map.set("value2", ethereum.Value.fromString(this.value2));
    map.set("value3", ethereum.Value.fromString(this.value3));
    return map;
  }
}

export class TokenFactory extends ethereum.SmartContract {
  static bind(address: Address): TokenFactory {
    return new TokenFactory("TokenFactory", address);
  }

  deployNewProject(
    _name: string,
    _symbol: string,
    baseURI: string,
    _ERC20token: Address,
    _projectOwner: Address,
    _projectBidder: Address,
    _auditors: Address
  ): Address {
    let result = super.call(
      "deployNewProject",
      "deployNewProject(string,string,string,address,address,address,address):(address)",
      [
        ethereum.Value.fromString(_name),
        ethereum.Value.fromString(_symbol),
        ethereum.Value.fromString(baseURI),
        ethereum.Value.fromAddress(_ERC20token),
        ethereum.Value.fromAddress(_projectOwner),
        ethereum.Value.fromAddress(_projectBidder),
        ethereum.Value.fromAddress(_auditors)
      ]
    );

    return result[0].toAddress();
  }

  try_deployNewProject(
    _name: string,
    _symbol: string,
    baseURI: string,
    _ERC20token: Address,
    _projectOwner: Address,
    _projectBidder: Address,
    _auditors: Address
  ): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "deployNewProject",
      "deployNewProject(string,string,string,address,address,address,address):(address)",
      [
        ethereum.Value.fromString(_name),
        ethereum.Value.fromString(_symbol),
        ethereum.Value.fromString(baseURI),
        ethereum.Value.fromAddress(_ERC20token),
        ethereum.Value.fromAddress(_projectOwner),
        ethereum.Value.fromAddress(_projectBidder),
        ethereum.Value.fromAddress(_auditors)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  getProject(_name: string): TokenFactory__getProjectResult {
    let result = super.call(
      "getProject",
      "getProject(string):(address,string,string,string)",
      [ethereum.Value.fromString(_name)]
    );

    return new TokenFactory__getProjectResult(
      result[0].toAddress(),
      result[1].toString(),
      result[2].toString(),
      result[3].toString()
    );
  }

  try_getProject(
    _name: string
  ): ethereum.CallResult<TokenFactory__getProjectResult> {
    let result = super.tryCall(
      "getProject",
      "getProject(string):(address,string,string,string)",
      [ethereum.Value.fromString(_name)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new TokenFactory__getProjectResult(
        value[0].toAddress(),
        value[1].toString(),
        value[2].toString(),
        value[3].toString()
      )
    );
  }

  nameToProjectIndex(param0: string): BigInt {
    let result = super.call(
      "nameToProjectIndex",
      "nameToProjectIndex(string):(uint256)",
      [ethereum.Value.fromString(param0)]
    );

    return result[0].toBigInt();
  }

  try_nameToProjectIndex(param0: string): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "nameToProjectIndex",
      "nameToProjectIndex(string):(uint256)",
      [ethereum.Value.fromString(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  nonce(): BigInt {
    let result = super.call("nonce", "nonce():(uint256)", []);

    return result[0].toBigInt();
  }

  try_nonce(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("nonce", "nonce():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  projects(param0: BigInt): Address {
    let result = super.call("projects", "projects(uint256):(address)", [
      ethereum.Value.fromUnsignedBigInt(param0)
    ]);

    return result[0].toAddress();
  }

  try_projects(param0: BigInt): ethereum.CallResult<Address> {
    let result = super.tryCall("projects", "projects(uint256):(address)", [
      ethereum.Value.fromUnsignedBigInt(param0)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  symbolToProjectIndex(param0: string): BigInt {
    let result = super.call(
      "symbolToProjectIndex",
      "symbolToProjectIndex(string):(uint256)",
      [ethereum.Value.fromString(param0)]
    );

    return result[0].toBigInt();
  }

  try_symbolToProjectIndex(param0: string): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "symbolToProjectIndex",
      "symbolToProjectIndex(string):(uint256)",
      [ethereum.Value.fromString(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }
}

export class DeployNewProjectCall extends ethereum.Call {
  get inputs(): DeployNewProjectCall__Inputs {
    return new DeployNewProjectCall__Inputs(this);
  }

  get outputs(): DeployNewProjectCall__Outputs {
    return new DeployNewProjectCall__Outputs(this);
  }
}

export class DeployNewProjectCall__Inputs {
  _call: DeployNewProjectCall;

  constructor(call: DeployNewProjectCall) {
    this._call = call;
  }

  get _name(): string {
    return this._call.inputValues[0].value.toString();
  }

  get _symbol(): string {
    return this._call.inputValues[1].value.toString();
  }

  get baseURI(): string {
    return this._call.inputValues[2].value.toString();
  }

  get _ERC20token(): Address {
    return this._call.inputValues[3].value.toAddress();
  }

  get _projectOwner(): Address {
    return this._call.inputValues[4].value.toAddress();
  }

  get _projectBidder(): Address {
    return this._call.inputValues[5].value.toAddress();
  }

  get _auditors(): Address {
    return this._call.inputValues[6].value.toAddress();
  }
}

export class DeployNewProjectCall__Outputs {
  _call: DeployNewProjectCall;

  constructor(call: DeployNewProjectCall) {
    this._call = call;
  }

  get value0(): Address {
    return this._call.outputValues[0].value.toAddress();
  }
}
