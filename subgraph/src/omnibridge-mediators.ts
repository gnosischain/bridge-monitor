import { log } from "@graphprotocol/graph-ts";
import { TokensBridged } from "../generated/OmniBridgeMediator/OmniBridgeMediators";
import { AMBTransaction } from "../generated/schema";

//-------------------------
// Foreign > Home
//-------------------------

// This is the step 2.
// After the threshold of validators signatures is reached, funds are released and the tx is marked as completed.
export function handlerTokensBridged(event: TokensBridged): void {
  const messageId = event.params.messageId;
  const receiver = event.params.recipient;
  const token = event.params.token;
  const amount = event.params.value;

  const transaction = AMBTransaction.load(messageId.toHexString());
  if (!transaction) {
    log.error(`handlerTokensBridged: AMBTransaction {} NOT FOUND - hash: {}`, [
      messageId.toHexString(),
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  transaction.receiver = receiver;
  transaction.receiverToken = token;
  transaction.receiverAmount = amount;
  transaction.save();
}
