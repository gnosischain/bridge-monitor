import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Validator } from "../../generated/schema";

/**
 * Sometimes we might want to deploy de subgraph in a development environment
 * Indexing the whole information from the beginning might take a lot of time.
 * So a way to speed up the process is to set the initial block number to start indexing to a number closer to the current block.
 * And mock the validators that were active at that time so validators signatures can be verified.
 */

export const AMB_telepathyAddress =
  "0xfdbf5711f77b97ea7f1f812832884c7328a682ec";

export function mockAMBValidators(): void {
  // we can assume if one of the validators is loaded, all of them are loaded
  const loaded = Validator.load("0x105cd22ed3d089bf5589c59b452f9de0796ca52d");
  if (loaded) {
    return;
  }

  const v1 = new Validator("0x105cd22ed3d089bf5589c59b452f9de0796ca52d");
  v1.name = "Giveth";
  v1.bridgeType = "AMB";
  v1.address = Bytes.fromHexString(
    "0x105cd22ed3d089bf5589c59b452f9de0796ca52d"
  );
  v1.lastActivity = BigInt.fromI32(1691605420);
  v1.hashAdded =
    "0x01b608491bdf1a8b067b743288f51017b7b8050399fc0f75989825431ae3010d";
  v1.hashRemoved = null;
  v1.removed = false;
  v1.save();

  const v2 = new Validator("0x258667e543c913264388b33328337257af208a8f");
  v2.name = "Gnosis Safe";
  v2.bridgeType = "AMB";
  v2.address = Bytes.fromHexString(
    "0x258667e543c913264388b33328337257af208a8f"
  );
  v2.lastActivity = BigInt.fromI32(1694110625);
  v2.hashAdded =
    "0x59d83f7f9716e7ca0246d0e80fda7ba2fd26c95e51d0c51d4a4ef851165b277f";
  v2.hashRemoved = null;
  v2.removed = false;
  v2.save();

  const v3 = new Validator("0x3e0a20099626f3d4d4ea7b0ce0330e88d1fe65d6");
  v3.name = "Gateway";
  v3.bridgeType = "AMB";
  v3.address = Bytes.fromHexString(
    "0x3e0a20099626f3d4d4ea7b0ce0330e88d1fe65d6"
  );
  v3.lastActivity = BigInt.fromI32(1693808850);
  v3.hashAdded =
    "0x0405db2c3d131b28b5ab852cfce075128a79af29e0d0ea4028928b80601f0094";
  v3.hashRemoved = null;
  v3.removed = false;
  v3.save();

  const v4 = new Validator("0x459a3bd49f1ff109bc90b76125533699aaaaf9a6");
  v4.name = "Protofire";
  v4.bridgeType = "AMB";
  v4.address = Bytes.fromHexString(
    "0x459a3bd49f1ff109bc90b76125533699aaaaf9a6"
  );
  v4.lastActivity = BigInt.fromI32(1694110620);
  v4.hashAdded =
    "0x52a51e364bd9f615279185e4a781af9c8d6fd15490f4f2e14a4db0717cc6e798";
  v4.hashRemoved = null;
  v4.removed = false;
  v4.save();

  const v5 = new Validator("0x674c97db4ce6cac04a124d745979f3e4cba0e9f0");
  v5.name = "Cow Protocol";
  v5.bridgeType = "AMB";
  v5.address = Bytes.fromHexString(
    "0x674c97db4ce6cac04a124d745979f3e4cba0e9f0"
  );
  v5.lastActivity = BigInt.fromI32(1694110625);
  v5.hashAdded =
    "0x59d83f7f9716e7ca0246d0e80fda7ba2fd26c95e51d0c51d4a4ef851165b277f";
  v5.hashRemoved = null;
  v5.removed = false;
  v5.save();

  const v6 = new Validator("0xbdc141c8d2343f33f40cb9edd601ccf460cd0dde");
  v6.name = "Gnosis DAO";
  v6.bridgeType = "AMB";
  v6.address = Bytes.fromHexString(
    "0xbdc141c8d2343f33f40cb9edd601ccf460cd0dde"
  );
  v6.lastActivity = BigInt.fromI32(1694110625);
  v6.hashAdded =
    "0x59d83f7f9716e7ca0246d0e80fda7ba2fd26c95e51d0c51d4a4ef851165b277f";
  v6.hashRemoved = null;
  v6.removed = false;
  v6.save();

  const v7 = new Validator("0xfa98b60e02a61b6590f073cad56e68326652d094");
  v7.name = "Kartpatkey";
  v7.bridgeType = "AMB";
  v7.address = Bytes.fromHexString(
    "0xfa98b60e02a61b6590f073cad56e68326652d094"
  );
  v7.lastActivity = BigInt.fromI32(1694109355);
  v7.hashAdded =
    "0xf3c53089bb6388218447f70e95feae2401ef40738c5fc37adff1b35d68b8e3ad";
  v7.hashRemoved = null;
  v7.removed = false;
  v7.save();

  const v8 = new Validator("0xfdbf5711f77b97ea7f1f812832884c7328a682ec");
  v8.name = "Telepathy";
  v8.bridgeType = "AMB";
  v8.address = Bytes.fromHexString(
    "0xfdbf5711f77b97ea7f1f812832884c7328a682ec"
  );
  v8.lastActivity = BigInt.fromI32(1694109355);
  v8.hashAdded =
    "0x5e75e262bf29422bdb46c34588d566708eec0e365d5c1f6c62c8fc169a36d520";
  v8.hashRemoved = null;
  v8.removed = false;
  v8.save();
}

export function mockXDAIValidators(): void {
  // we can assume if one of the validators is loaded, all of them are loaded
  const loaded = Validator.load("0x587c0d02b40822f15f05301d87c16f6a08aaddde");
  if (loaded) {
    return;
  }

  const v1 = new Validator("0x587c0d02b40822f15f05301d87c16f6a08aaddde");
  v1.name = "Cow Protocol";
  v1.bridgeType = "XDAI";
  v1.address = Bytes.fromHexString(
    "0x587c0d02b40822f15f05301d87c16f6a08aaddde"
  );
  v1.lastActivity = BigInt.fromI32(1691605420);
  v1.hashAdded =
    "0x01b608491bdf1a8b067b743288f51017b7b8050399fc0f75989825431ae3010d";
  v1.hashRemoved = null;
  v1.removed = false;
  v1.save();

  const v2 = new Validator("0xc073c8e5ed9aa11cf6776c69b3e13b259ba9f506");
  v2.name = "Giveth";
  v2.bridgeType = "XDAI";
  v2.address = Bytes.fromHexString(
    "0xc073c8e5ed9aa11cf6776c69b3e13b259ba9f506"
  );
  v2.lastActivity = BigInt.fromI32(1691605420);
  v2.hashAdded =
    "0x01b608491bdf1a8b067b743288f51017b7b8050399fc0f75989825431ae3010d";
  v2.hashRemoved = null;
  v2.removed = false;
  v2.save();

  const v3 = new Validator("0x97630e2ae609d4104abda91f3066c556403182dd");
  v3.name = "Gnosis DAO";
  v3.bridgeType = "XDAI";
  v3.address = Bytes.fromHexString(
    "0x97630e2ae609d4104abda91f3066c556403182dd"
  );
  v3.lastActivity = BigInt.fromI32(1691605420);
  v3.hashAdded =
    "0x01b608491bdf1a8b067b743288f51017b7b8050399fc0f75989825431ae3010d";
  v3.hashRemoved = null;
  v3.removed = false;
  v3.save();

  const v4 = new Validator("0x1312e98995bbcc30fc63db3cef807e20cdd33dca");
  v4.name = "Gnosis Safe";
  v4.bridgeType = "XDAI";
  v4.address = Bytes.fromHexString(
    "0x1312e98995bbcc30fc63db3cef807e20cdd33dca"
  );
  v4.lastActivity = BigInt.fromI32(1691605420);
  v4.hashAdded =
    "0x01b608491bdf1a8b067b743288f51017b7b8050399fc0f75989825431ae3010d";
  v4.hashRemoved = null;
  v4.removed = false;
  v4.save();

  const v5 = new Validator("0x4d1c96b9a49c4469a0b720a22b74b034eddfe051");
  v5.name = "Protofire";
  v5.bridgeType = "XDAI";
  v5.address = Bytes.fromHexString(
    "0x4d1c96b9a49c4469a0b720a22b74b034eddfe051"
  );
  v5.lastActivity = BigInt.fromI32(1691605420);
  v5.hashAdded =
    "0x01b608491bdf1a8b067b743288f51017b7b8050399fc0f75989825431ae3010d";
  v5.hashRemoved = null;
  v5.removed = false;
  v5.save();

  const v6 = new Validator("0xfe24cfb2f8872e9ed097c451de065a9f6048915b");
  v6.name = "Syncnode";
  v6.bridgeType = "XDAI";
  v6.address = Bytes.fromHexString(
    "0xfe24cfb2f8872e9ed097c451de065a9f6048915b"
  );
  v6.lastActivity = BigInt.fromI32(1691605420);
  v6.hashAdded =
    "0x01b608491bdf1a8b067b743288f51017b7b8050399fc0f75989825431ae3010d";
  v6.hashRemoved = null;
  v6.removed = false;
  v6.save();

  const v7 = new Validator("0x90776017057b84bc47d7e7383b65c463c80a6cdd");
  v7.name = "Gateway";
  v7.bridgeType = "XDAI";
  v7.address = Bytes.fromHexString(
    "0x90776017057b84bc47d7e7383b65c463c80a6cdd"
  );
  v7.lastActivity = BigInt.fromI32(1691605420);
  v7.hashAdded =
    "0x01b608491bdf1a8b067b743288f51017b7b8050399fc0f75989825431ae3010d";
  v7.hashRemoved = null;
  v7.removed = false;
  v7.save();
}
