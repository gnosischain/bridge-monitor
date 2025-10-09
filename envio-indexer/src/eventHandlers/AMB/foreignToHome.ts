import { AMBForeign, AMBHome } from "generated";
import { BridgeTypeEnum, CHAIN, TransactionStatusEnum } from "../../const";
import { getValidator } from "../../utils/getValidator";
import { isOmniBridgeUsage, extractReceiverFromEncodedData, parseMessageIdFromEncodedData } from "../../utils/omnibridge";
import { getAmbMessageByHash } from "../../effects/getAmbMessageByHash";

/**
 * AMB Foreign -> Home (ETH -> GC)
 * Flow:
 * 1) Foreign AMB: UserRequestForAffirmation => INITIATED Transaction (only for OmniBridge token flows)
 * 2) Home AMB: SignedForAffirmation => update validator lastActivity (optional COLLECTING skipped: no message() call)
 * 3) Home AMB: AffirmationCompleted => create TransactionExecution (executor = tx.from validator) and COMPLETE/ERROR the Transaction
 */

// [Foreign] Ethereum
// 1. Init. Bridging started (create Transaction using AMBTransfer side table)
AMBForeign.UserRequestForAffirmation.handler(async ({ event, context }) => {
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

      initiatorNetwork: CHAIN.FOREIGN.ID,
      initiator: transfer?.sender,
      initiatorToken: transfer?.token,
      initiatorAmount: transfer?.amount,

      receiverNetwork: CHAIN.HOME.ID,
      receiver: receiver,
      receiverToken: transfer?.token,
      receiverAmount: transfer?.amount,
    };
    context.Transaction.set(newTx);
  }
});

// [Home] Gnosis
// 2. Validation. Validators sign transaction (update validator lastActivity)
AMBHome.SignedForAffirmation.handler(async ({ event, context }) => {
  const signer = event.params.signer.toLowerCase();
  const validator = await getValidator(context, signer);
  if (!validator) {
    context.log.error(`AMB: SignedForAffirmation - Validator ${signer} not found`);
    return;
  }
  context.Validator.set({ ...validator, lastActivity: BigInt(event.block.timestamp) });

  // Resolve messageId for signature: lookup-first, effect-once fallback
  const messageHash = event.params.messageHash;
  let messageId: string | undefined;

  const cached = await context.AMBMessageHashLookup.get(messageHash);
  if (cached?.messageId) {
    messageId = cached.messageId;
  } else {
    const encoded = await context.effect(getAmbMessageByHash, {
      address: event.srcAddress,
      messageHash,
    });
    messageId = typeof encoded === "string" ? parseMessageIdFromEncodedData(encoded) : undefined;
    if (messageId) {
      // Cache mapping for future signatures (avoid effect)
      context.AMBMessageHashLookup.set({ id: messageHash, messageId });
      // Persist the hash on AMBTransfer
      const amb = await context.AMBTransfer.get(messageId);
      if (amb && !amb.messageHash) {
        context.AMBTransfer.set({ ...amb, messageHash });
      }
    }
  }

  if (messageId) {
    const tx = await context.Transaction.get(messageId);
    if (tx) {
      const validationId = `${messageId}-${signer}`;
      const validation = {
        id: validationId,
        transaction_id: messageId,
        validator_id: validator.id,
        validatorAddress: validator.address,
        transactionHash: event.transaction.hash,
        timestamp: BigInt(event.block.timestamp),
      };
      context.TransactionValidation.set(validation);

      // Nudge status from INITIATED to COLLECTING when first signature arrives
      if (tx.transactionStatus === TransactionStatusEnum.INITIATED) {
        context.Transaction.set({ ...tx, transactionStatus: TransactionStatusEnum.COLLECTING });
      }

      // Persist the hash on AMBTransfer for future direct lookups
      const amb = await context.AMBTransfer.get(messageId);
      if (amb && !amb.messageHash) {
        context.AMBTransfer.set({ ...amb, messageHash });
      }
    }
  }
});

// [Home] Gnosis
// 3. Execution. Validator executes transaction (complete Transaction)
AMBHome.AffirmationCompleted.handler(async ({ event, context }) => {
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

      initiatorNetwork: CHAIN.FOREIGN.ID,
      initiator: transfer.sender,
      initiatorToken: transfer.token,
      initiatorAmount: transfer.amount,

      receiverNetwork: CHAIN.HOME.ID,
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
