import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { handleUserRequestForSignature } from "../src/home-bridge-erc-to-native"
import { createUserRequestForSignatureEvent } from "./home-bridge-erc-to-native-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let recipient = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let value = BigInt.fromI32(234)
    let newUserRequestForSignatureEvent = createUserRequestForSignatureEvent(
      recipient,
      value
    )
    handleUserRequestForSignature(newUserRequestForSignatureEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("Transaction created and stored", () => {
    assert.entityCount("Transaction", 1)
  })
})
