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

  get owner(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get project(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get timelinesOwner(): Array<BigInt> {
    return this._event.parameters[3].value.toBigIntArray();
  }

  get budgetsOwner(): Array<BigInt> {
    return this._event.parameters[4].value.toBigIntArray();
  }

  get milestones(): string {
    return this._event.parameters[5].value.toString();
  }
}

export class ProjectTrackerFactory__getProjectResult {
  value0: Address;
  value1: string;

  constructor(value0: Address, value1: string) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromAddress(this.value0));
    map.set("value1", ethereum.Value.fromString(this.value1));
    return map;
  }
}

export class ProjectTrackerFactory extends ethereum.SmartContract {
  static bind(address: Address): ProjectTrackerFactory {
    return new ProjectTrackerFactory("ProjectTrackerFactory", address);
  }

  deployNewProject(
    _owner: Address,
    _HolderFactory: Address,
    _TokenFactory: Address,
    _name: string,
    _symbol: string,
    _milestones: string,
    _timeline: Array<BigInt>,
    _budgets: Array<BigInt>
  ): Address {
    let result = super.call(
      "deployNewProject",
      "deployNewProject(address,address,address,string,string,string,uint256[],uint256[]):(address)",
      [
        ethereum.Value.fromAddress(_owner),
        ethereum.Value.fromAddress(_HolderFactory),
        ethereum.Value.fromAddress(_TokenFactory),
        ethereum.Value.fromString(_name),
        ethereum.Value.fromString(_symbol),
        ethereum.Value.fromString(_milestones),
        ethereum.Value.fromUnsignedBigIntArray(_timeline),
        ethereum.Value.fromUnsignedBigIntArray(_budgets)
      ]
    );

    return result[0].toAddress();
  }

  try_deployNewProject(
    _owner: Address,
    _HolderFactory: Address,
    _TokenFactory: Address,
    _name: string,
    _symbol: string,
    _milestones: string,
    _timeline: Array<BigInt>,
    _budgets: Array<BigInt>
  ): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "deployNewProject",
      "deployNewProject(address,address,address,string,string,string,uint256[],uint256[]):(address)",
      [
        ethereum.Value.fromAddress(_owner),
        ethereum.Value.fromAddress(_HolderFactory),
        ethereum.Value.fromAddress(_TokenFactory),
        ethereum.Value.fromString(_name),
        ethereum.Value.fromString(_symbol),
        ethereum.Value.fromString(_milestones),
        ethereum.Value.fromUnsignedBigIntArray(_timeline),
        ethereum.Value.fromUnsignedBigIntArray(_budgets)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  getProject(_name: string): ProjectTrackerFactory__getProjectResult {
    let result = super.call(
      "getProject",
      "getProject(string):(address,string)",
      [ethereum.Value.fromString(_name)]
    );

    return new ProjectTrackerFactory__getProjectResult(
      result[0].toAddress(),
      result[1].toString()
    );
  }

  try_getProject(
    _name: string
  ): ethereum.CallResult<ProjectTrackerFactory__getProjectResult> {
    let result = super.tryCall(
      "getProject",
      "getProject(string):(address,string)",
      [ethereum.Value.fromString(_name)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new ProjectTrackerFactory__getProjectResult(
        value[0].toAddress(),
        value[1].toString()
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

  get _owner(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _HolderFactory(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get _TokenFactory(): Address {
    return this._call.inputValues[2].value.toAddress();
  }

  get _name(): string {
    return this._call.inputValues[3].value.toString();
  }

  get _symbol(): string {
    return this._call.inputValues[4].value.toString();
  }

  get _milestones(): string {
    return this._call.inputValues[5].value.toString();
  }

  get _timeline(): Array<BigInt> {
    return this._call.inputValues[6].value.toBigIntArray();
  }

  get _budgets(): Array<BigInt> {
    return this._call.inputValues[7].value.toBigIntArray();
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