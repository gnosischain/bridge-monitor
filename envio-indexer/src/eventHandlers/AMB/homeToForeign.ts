import { AMBForeign, AMBHome } from "generated";
import { BridgeTypeEnum, CHAIN, TransactionStatusEnum } from "../../const";
import { getValidator } from "../../utils/getValidator";
import { isOmniBridgeUsage, extractReceiverFromEncodedData } from "../../utils/omnibridge";

/**
 * AMB Home -> Foreign (GC -> ETH)
 * Flow:
 * 1) Home AMB: UserRequestForSignature => INITIATED Transaction (only for OmniBridge token flows)
 * 2) Home AMB: SignedForUserRequest / CollectedSignatures => update validator lastActivity
 * 3) Foreign AMB: RelayedMessage => create TransactionExecution (executor = tx.from validator) and COMPLETE/ERROR the Transaction
 */

// [Home] Gnosis
// 1 Init. Bridging started (create Transaction using AMBTransfer side table)
AMBHome.UserRequestForSignature.handler(async ({ event, context }) => {
  const transactionHash = event.transaction.hash;
  const timestamp = event.block.timestamp;
  const messageId = event.params.messageId;
  const encodedData = event.params.encodedData;

  // Subgraph-aligned filter by OmniBridge usage using encodedData mediator pair
  if (!isOmniBridgeUsage(encodedData)) {
    return;
  }

  // AMBTransfer may or may not be persisted yet (mediator handlers could run after)
  const transfer = await context.AMBTransfer.get(messageId);

  // Extract receiver from encoded data
  const receiver = extractReceiverFromEncodedData(encodedData);

  const existing = await context.Transaction.get(messageId);
  if (!existing) {
    const newTx = {
      id: messageId,
      messageId,
      nonce: messageId,
      transactionHash,
      timestamp: BigInt(timestamp),
      bridgeType: BridgeTypeEnum.AMB,
      transactionStatus: TransactionStatusEnum.INITIATED,
      execution_id: undefined,

      initiatorNetwork: CHAIN.HOME.ID,
      initiator: transfer?.sender,
      initiatorToken: transfer?.token,
      initiatorAmount: transfer?.amount,

      receiverNetwork: CHAIN.FOREIGN.ID,
      receiver: receiver,
      receiverToken: transfer?.token,
      receiverAmount: transfer?.amount,
    };
    context.Transaction.set(newTx);
  }
});

// [Home] Gnosis
// 2 Validation. Validators sign transaction (update validator lastActivity)
AMBHome.SignedForUserRequest.handler(async ({ event, context }) => {
  const signer = event.params.signer.toLowerCase();
  const validator = await getValidator(context, signer);
  if (!validator) {
    context.log.error(`AMB: SignedForUserRequest - Validator ${signer} not found`);
    return;
  }
  context.Validator.set({ ...validator, lastActivity: BigInt(event.block.timestamp) });
});

// [Home] Gnosis
// 3 Ready to execute on Foreign (threshold reached). Update validator lastActivity
AMBHome.CollectedSignatures.handler(async ({ event, context }) => {
  const executorAddress = event.params.authorityResponsibleForRelay.toLowerCase();
  const validator = await getValidator(context, executorAddress);
  if (!validator) {
    context.log.error(`AMB: CollectedSignatures - Validator ${executorAddress} not found`);
    return;
  }
  context.Validator.set({ ...validator, lastActivity: BigInt(event.block.timestamp) });
});

// [Foreign] Ethereum
// 4 Execution (token claimed) - complete Transaction
AMBForeign.RelayedMessage.handler(async ({ event, context }) => {
  const transactionHash = event.transaction.hash;
  const timestamp = event.block.timestamp;
  const messageId = event.params.messageId;
  const status = event.params.status;

  // Must be OmniBridge token bridging; read final receiver/amount/token from AMBTransfer
  const transfer = await context.AMBTransfer.get(messageId);
  if (!transfer) {
    return;
  }

  // Attribute execution to tx.from validator (mirrors XDAI approach)
  const executorAddr = event.transaction.from?.toLowerCase();
  let executorId: string | undefined = undefined;
  let executorAddress: string | undefined = undefined;
  if (executorAddr) {
    const validator = await getValidator(context, executorAddr);
    if (validator) {
      context.Validator.set({ ...validator, lastActivity: BigInt(timestamp) });
      executorId = validator.id;
      executorAddress = validator.address;
    }
  }

  const executionId = `${messageId}-${executorId ?? "unknown"}`;
  const execution = {
    id: executionId,
    transaction_id: messageId,
    transactionHash,
    timestamp: BigInt(timestamp),
    executor_id: executorId,
    executorAddress,
  };
  context.TransactionExecution.set(execution);

  const tx = await context.Transaction.get(messageId);
  if (!tx) {
    const newTx = {
      id: messageId,
      messageId,
      nonce: messageId,
      transactionHash,
      timestamp: BigInt(timestamp),
      bridgeType: BridgeTypeEnum.AMB,
      transactionStatus: status ? TransactionStatusEnum.COMPLETED : TransactionStatusEnum.ERROR,
      execution_id: executionId,

      initiatorNetwork: CHAIN.HOME.ID,
      initiator: transfer.sender,
      initiatorToken: transfer.token,
      initiatorAmount: transfer.amount,

      receiverNetwork: CHAIN.FOREIGN.ID,
      receiver: transfer.recipient,
      receiverToken: transfer.token,
      receiverAmount: transfer.amount,
    };
    context.Transaction.set(newTx);
  } else {
    const updated = {
      ...tx,
      transactionStatus: status ? TransactionStatusEnum.COMPLETED : TransactionStatusEnum.ERROR,
      execution_id: executionId,
      receiver: transfer.recipient ?? tx.receiver,
      receiverToken: transfer.token ?? tx.receiverToken,
      receiverAmount: transfer.amount ?? tx.receiverAmount,
      initiator: tx.initiator ?? transfer.sender,
      initiatorToken: tx.initiatorToken ?? transfer.token,
      initiatorAmount: tx.initiatorAmount ?? transfer.amount,
      nonce: tx.nonce ?? messageId,
    };
    context.Transaction.set(updated);
  }
});
