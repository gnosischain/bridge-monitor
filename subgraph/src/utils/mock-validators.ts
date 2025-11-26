import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Validator } from "../../generated/schema";

/**
 * Sometimes we might want to deploy de subgraph in a development environment
 * Indexing the whole information from the beginning might take a lot of time.
 * So a way to speed up the process is to set the initial block number to start indexing to a number closer to the current block.
 * And mock the validators that were active at that time so validators signatures can be verified.
 */

export const AMB_telepathyAddress =
  "0x456c255A8BC1F33778603A2a48Eb6B0C69F4d48E";

export function mockAMBValidators(): void {
  // we can assume if one of the validators is loaded, all of them are loaded
  const loaded = Validator.load(
    "0x105cd22ed3d089bf5589c59b452f9de0796ca52d-AMB"
  );
  if (loaded) {
    return;
  }

  // giveth
  const giveth = new Validator(
    "0x105cd22ed3d089bf5589c59b452f9de0796ca52d-AMB"
  );
  giveth.name = "Giveth";
  giveth.bridgeType = "AMB";
  giveth.address = Bytes.fromHexString(
    "0x105cd22ed3d089bf5589c59b452f9de0796ca52d"
  );
  giveth.lastActivity = BigInt.fromI32(1691605420);
  giveth.hashAdded =
    "0x01b608491bdf1a8b067b743288f51017b7b8050399fc0f75989825431ae3010d";
  giveth.hashRemoved = null;
  giveth.removed = false;
  giveth.save();

  // safe
  const safe = new Validator("0x258667e543c913264388b33328337257af208a8f-AMB");
  safe.name = "Safe";
  safe.bridgeType = "AMB";
  safe.address = Bytes.fromHexString(
    "0x258667e543c913264388b33328337257af208a8f"
  );
  safe.lastActivity = BigInt.fromI32(1694110625);
  safe.hashAdded =
    "0x59d83f7f9716e7ca0246d0e80fda7ba2fd26c95e51d0c51d4a4ef851165b277f";
  safe.hashRemoved = null;
  safe.removed = false;
  safe.save();

  // gateway
  const gateway = new Validator(
    "0x3e0a20099626f3d4d4ea7b0ce0330e88d1fe65d6-AMB"
  );
  gateway.name = "Gateway";
  gateway.bridgeType = "AMB";
  gateway.address = Bytes.fromHexString(
    "0x3e0a20099626f3d4d4ea7b0ce0330e88d1fe65d6"
  );
  gateway.lastActivity = BigInt.fromI32(1693808850);
  gateway.hashAdded =
    "0x0405db2c3d131b28b5ab852cfce075128a79af29e0d0ea4028928b80601f0094";
  gateway.hashRemoved = null;
  gateway.removed = false;
  gateway.save();

  // protofire
  const protofire = new Validator(
    "0x459a3bd49f1ff109bc90b76125533699aaaaf9a6-AMB"
  );
  protofire.name = "Protofire";
  protofire.bridgeType = "AMB";
  protofire.address = Bytes.fromHexString(
    "0x459a3bd49f1ff109bc90b76125533699aaaaf9a6"
  );
  protofire.lastActivity = BigInt.fromI32(1694110620);
  protofire.hashAdded =
    "0x52a51e364bd9f615279185e4a781af9c8d6fd15490f4f2e14a4db0717cc6e798";
  protofire.hashRemoved = null;
  protofire.removed = false;
  protofire.save();

  // cow
  const cow = new Validator("0x674c97db4ce6cac04a124d745979f3e4cba0e9f0-AMB");
  cow.name = "Cow Protocol";
  cow.bridgeType = "AMB";
  cow.address = Bytes.fromHexString(
    "0x674c97db4ce6cac04a124d745979f3e4cba0e9f0"
  );
  cow.lastActivity = BigInt.fromI32(1694110625);
  cow.hashAdded =
    "0x59d83f7f9716e7ca0246d0e80fda7ba2fd26c95e51d0c51d4a4ef851165b277f";
  cow.hashRemoved = null;
  cow.removed = false;
  cow.save();

  // gnosis
  const gnosis = new Validator(
    "0xbdc141c8d2343f33f40cb9edd601ccf460cd0dde-AMB"
  );
  gnosis.name = "Gnosis DAO";
  gnosis.bridgeType = "AMB";
  gnosis.address = Bytes.fromHexString(
    "0xbdc141c8d2343f33f40cb9edd601ccf460cd0dde"
  );
  gnosis.lastActivity = BigInt.fromI32(1694110625);
  gnosis.hashAdded =
    "0x59d83f7f9716e7ca0246d0e80fda7ba2fd26c95e51d0c51d4a4ef851165b277f";
  gnosis.hashRemoved = null;
  gnosis.removed = false;
  gnosis.save();

  // karpakey
  const karpakey = new Validator(
    "0xfa98b60e02a61b6590f073cad56e68326652d094-AMB"
  );
  karpakey.name = "Karpatkey";
  karpakey.bridgeType = "AMB";
  karpakey.address = Bytes.fromHexString(
    "0xfa98b60e02a61b6590f073cad56e68326652d094"
  );
  karpakey.lastActivity = BigInt.fromI32(1694109355);
  karpakey.hashAdded =
    "0xf3c53089bb6388218447f70e95feae2401ef40738c5fc37adff1b35d68b8e3ad";
  karpakey.hashRemoved = null;
  karpakey.removed = false;
  karpakey.save();

  // telepathy
  const telepathy = new Validator(
    "0x456c255A8BC1F33778603A2a48Eb6B0C69F4d48E-AMB"
  );
  telepathy.name = "Telepathy";
  telepathy.bridgeType = "AMB";
  telepathy.address = Bytes.fromHexString(
    "0x456c255A8BC1F33778603A2a48Eb6B0C69F4d48E"
  );
  telepathy.lastActivity = BigInt.fromI32(1694109355);
  telepathy.hashAdded =
    "0x5e75e262bf29422bdb46c34588d566708eec0e365d5c1f6c62c8fc169a36d520";
  telepathy.hashRemoved = null;
  telepathy.removed = false;
  telepathy.save();
}

export function mockXDAIValidators(): void {
  // we can assume if one of the validators is loaded, all of them are loaded
  const loaded = Validator.load(
    "0x587c0d02b40822f15f05301d87c16f6a08aaddde-XDAI"
  );
  if (loaded) {
    return;
  }

  // karpatkey
  const karpatkey = new Validator(
    "0xfa98b60e02a61b6590f073cad56e68326652d094-XDAI"
  );
  karpatkey.name = "Karpatkey";
  karpatkey.bridgeType = "XDAI";
  karpatkey.address = Bytes.fromHexString(
    "0xfa98b60e02a61b6590f073cad56e68326652d094"
  );
  karpatkey.lastActivity = BigInt.fromI32(1691605420);
  karpatkey.hashAdded =
    "0x01b608491bdf1a8b067b743288f51017b7b8050399fc0f75989825431ae3010d";
  karpatkey.hashRemoved = null;
  karpatkey.removed = false;
  karpatkey.save();

  // cow
  const cow = new Validator("0x587c0d02b40822f15f05301d87c16f6a08aaddde-XDAI");
  cow.name = "Cow Protocol";
  cow.bridgeType = "XDAI";
  cow.address = Bytes.fromHexString(
    "0x587c0d02b40822f15f05301d87c16f6a08aaddde"
  );
  cow.lastActivity = BigInt.fromI32(1691605420);
  cow.hashAdded =
    "0x01b608491bdf1a8b067b743288f51017b7b8050399fc0f75989825431ae3010d";
  cow.hashRemoved = null;
  cow.removed = false;
  cow.save();

  // giveth
  const giveth = new Validator(
    "0xc073c8e5ed9aa11cf6776c69b3e13b259ba9f506-XDAI"
  );
  giveth.name = "Giveth";
  giveth.bridgeType = "XDAI";
  giveth.address = Bytes.fromHexString(
    "0xc073c8e5ed9aa11cf6776c69b3e13b259ba9f506"
  );
  giveth.lastActivity = BigInt.fromI32(1691605420);
  giveth.hashAdded =
    "0x01b608491bdf1a8b067b743288f51017b7b8050399fc0f75989825431ae3010d";
  giveth.hashRemoved = null;
  giveth.removed = false;
  giveth.save();

  // gnosis
  const gnosis = new Validator(
    "0x97630e2ae609d4104abda91f3066c556403182dd-XDAI"
  );
  gnosis.name = "Gnosis DAO";
  gnosis.bridgeType = "XDAI";
  gnosis.address = Bytes.fromHexString(
    "0x97630e2ae609d4104abda91f3066c556403182dd"
  );
  gnosis.lastActivity = BigInt.fromI32(1691605420);
  gnosis.hashAdded =
    "0x01b608491bdf1a8b067b743288f51017b7b8050399fc0f75989825431ae3010d";
  gnosis.hashRemoved = null;
  gnosis.removed = false;
  gnosis.save();

  // safe
  const safe = new Validator("0x1312e98995bbcc30fc63db3cef807e20cdd33dca-XDAI");
  safe.name = "Safe";
  safe.bridgeType = "XDAI";
  safe.address = Bytes.fromHexString(
    "0x1312e98995bbcc30fc63db3cef807e20cdd33dca"
  );
  safe.lastActivity = BigInt.fromI32(1691605420);
  safe.hashAdded =
    "0x01b608491bdf1a8b067b743288f51017b7b8050399fc0f75989825431ae3010d";
  safe.hashRemoved = null;
  safe.removed = false;
  safe.save();

  // protofire
  const protofire = new Validator(
    "0x4d1c96b9a49c4469a0b720a22b74b034eddfe051-XDAI"
  );
  protofire.name = "Protofire";
  protofire.bridgeType = "XDAI";
  protofire.address = Bytes.fromHexString(
    "0x4d1c96b9a49c4469a0b720a22b74b034eddfe051"
  );
  protofire.lastActivity = BigInt.fromI32(1691605420);
  protofire.hashAdded =
    "0x01b608491bdf1a8b067b743288f51017b7b8050399fc0f75989825431ae3010d";
  protofire.hashRemoved = null;
  protofire.removed = false;
  protofire.save();

  // gateway
  const gateway = new Validator(
    "0x90776017057b84bc47d7e7383b65c463c80a6cdd-XDAI"
  );
  gateway.name = "Gateway";
  gateway.bridgeType = "XDAI";
  gateway.address = Bytes.fromHexString(
    "0x90776017057b84bc47d7e7383b65c463c80a6cdd"
  );
  gateway.lastActivity = BigInt.fromI32(1691605420);
  gateway.hashAdded =
    "0x01b608491bdf1a8b067b743288f51017b7b8050399fc0f75989825431ae3010d";
  gateway.hashRemoved = null;
  gateway.removed = false;
  gateway.save();
}
