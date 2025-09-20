import assert from "assert";
import { 
  TestHelpers,
  XDaiForeign_RelayedMessage
} from "generated";
const { MockDb, XDaiForeign } = TestHelpers;

describe("XDaiForeign contract RelayedMessage event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for XDaiForeign contract RelayedMessage event
  const event = XDaiForeign.RelayedMessage.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("XDaiForeign_RelayedMessage is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await XDaiForeign.RelayedMessage.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualXDaiForeignRelayedMessage = mockDbUpdated.entities.XDaiForeign_RelayedMessage.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedXDaiForeignRelayedMessage: XDaiForeign_RelayedMessage = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      recipient: event.params.recipient,
      value: event.params.value,
      transactionHash: event.params.transactionHash,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualXDaiForeignRelayedMessage, expectedXDaiForeignRelayedMessage, "Actual XDaiForeignRelayedMessage should be the same as the expectedXDaiForeignRelayedMessage");
  });
});
