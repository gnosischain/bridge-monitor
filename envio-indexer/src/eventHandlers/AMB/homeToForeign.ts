import { indexer, AMBForeign, AMBHome } from "envio";
import { BridgeTypeEnum, CHAIN, TransactionStatusEnum } from "../../const";
import { getValidator } from "../../utils/getValidator";
import { isOmniBridgeUsage, extractReceiverFromEncodedData, isRouterContract } from "../../utils/omnibridge";
import { decodeFunctionData, parseAbiItem } from 'viem'

/**
 * AMB Home -> Foreign (GC -> ETH)
 * Flow:
 * 1) Home AMB: UserRequestForSignature => INITIATED Transaction (only for OmniBridge token flows)
 * 2) Home AMB: SignedForUserRequest / CollectedSignatures => update validator lastActivity
 * 3) Foreign AMB: RelayedMessage => create TransactionExecution (executor = tx.from validator) and COMPLETE/ERROR the Transaction
 */

// [Home] Gnosis
// 1 Init. Bridging started (create Transaction using AMBTransfer side table)
indexer.onEvent(
  { contract: "AMBHome", event: "UserRequestForSignature" },
  async ({ event, context }) => {
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

  // Extract receiver from encoded data, fall back to sender if extraction fails
  // or if receiver is a router contract (e.g., WETHOmnibridgeRouter)
  // Most users bridge to themselves, so sender == receiver is a reasonable fallback
  const extractedReceiver = extractReceiverFromEncodedData(encodedData);
  const sender = transfer?.sender?.toLowerCase();
  const isRouterReceiver = isRouterContract(extractedReceiver);
  const receiver = (extractedReceiver && !isRouterReceiver)
    ? extractedReceiver.toLowerCase()
    : sender;

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
      initiator: sender,
      initiatorToken: transfer?.token,
      initiatorAmount: transfer?.amount,

      receiverNetwork: CHAIN.FOREIGN.ID,
      receiver,
      receiverToken: transfer?.token,
      receiverAmount: transfer?.amount,
    };
    context.Transaction.set(newTx);
  }
}
);

// [Home] Gnosis
// 2 Validation. Validators sign transaction (update validator lastActivity)
indexer.onEvent(
  { contract: "AMBHome", event: "SignedForUserRequest" },
  async ({ event, context }) => {
  const signer = event.params.signer.toLowerCase();
  const validator = await getValidator(context, signer, BridgeTypeEnum.AMB);
  if (!validator) {
    context.log.error(`AMB: SignedForUserRequest - Validator ${signer} not found, tx hash: ${event.transaction.hash}`);
    return;
  }
  context.Validator.set({ ...validator, lastActivity: BigInt(event.block.timestamp) });

  // extract out the message frrom message
  const rawInput = event.transaction.input as `0x${string}`;
  const { functionName, args } = decodeFunctionData({
    abi: [parseAbiItem("function submitSignature(bytes signature, bytes message)")],
    data: rawInput
  })
  const message = args[1];
  let messageId: string | undefined;
   messageId = message.slice(0, 66);
  

  if (messageId) {
    const tx = await context.Transaction.get(messageId);
    if (tx) {
      const validationId = `${messageId}-${signer}`;
      const validation = {
        id: validationId,
        transaction_id: messageId,
        validator_id: validator.id,
        validatorAddress: validator.address.toLowerCase(),
        transactionHash: event.transaction.hash,
        timestamp: BigInt(event.block.timestamp),
      };
      context.TransactionValidation.set(validation);

      // Nudge status from INITIATED to COLLECTING when first signature arrives
      if (tx.transactionStatus === TransactionStatusEnum.INITIATED) {
        context.Transaction.set({ ...tx, transactionStatus: TransactionStatusEnum.COLLECTING });
      }
    }
  }
}
);

// [Home] Gnosis
// 3 Ready to execute on Foreign (threshold reached). Update validator lastActivity
indexer.onEvent(
  { contract: "AMBHome", event: "CollectedSignatures" },
  async ({ event, context }) => {
  const executorAddress = event.params.authorityResponsibleForRelay.toLowerCase();
  const validator = await getValidator(context, executorAddress, BridgeTypeEnum.AMB);
  if (!validator) {
    context.log.error(`AMB: CollectedSignatures - Validator ${executorAddress} not found, tx hash: ${event.transaction.hash}`);
    return;
  }
  context.Validator.set({ ...validator, lastActivity: BigInt(event.block.timestamp) });

  // filter out message from input
  const rawInput = event.transaction.input as `0x${string}`;
  const { functionName, args } = decodeFunctionData({
    abi: [parseAbiItem("function submitSignature(bytes signature, bytes message)")],
    data: rawInput
  })
  const message = args[1];
  let messageId: string | undefined;
   messageId = message.slice(0, 66);
  

  if (messageId) {
    const tx = await context.Transaction.get(messageId);
    if (tx && tx.transactionStatus !== TransactionStatusEnum.COMPLETED && tx.transactionStatus !== TransactionStatusEnum.ERROR) {
      context.Transaction.set({ ...tx, transactionStatus: TransactionStatusEnum.UNCLAIMED });
    }
  }
}
);

// [Foreign] Ethereum
// 4 Execution (token claimed) - complete Transaction
indexer.onEvent(
  { contract: "AMBForeign", event: "RelayedMessage" },
  async ({ event, context }) => {
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
  let executorAddress: string | undefined = executorAddr;
  if (executorAddr) {
    const validator = await getValidator(context, executorAddr, BridgeTypeEnum.AMB);
    if (validator) {
      context.Validator.set({ ...validator, lastActivity: BigInt(timestamp) });
      executorId = validator.id;
      executorAddress = validator.address.toLowerCase();
    } else {
      // claiming can be done by anyone
      executorAddress = executorAddr;
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
      initiator: transfer.sender?.toLowerCase(),
      initiatorToken: transfer.token,
      initiatorAmount: transfer.amount,

      receiverNetwork: CHAIN.FOREIGN.ID,
      receiver: transfer.recipient?.toLowerCase(),
      receiverToken: transfer.token,
      receiverAmount: transfer.amount,
    };
    context.Transaction.set(newTx);
  } else {
    const updated = {
      ...tx,
      transactionStatus: status ? TransactionStatusEnum.COMPLETED : TransactionStatusEnum.ERROR,
      execution_id: executionId,
      receiver: transfer.recipient?.toLowerCase() ?? tx.receiver?.toLowerCase(),
      receiverToken: transfer.token ?? tx.receiverToken,
      receiverAmount: transfer.amount ?? tx.receiverAmount,
      initiator: tx.initiator?.toLowerCase() ?? transfer.sender?.toLowerCase(),
      initiatorToken: tx.initiatorToken ?? transfer.token,
      initiatorAmount: tx.initiatorAmount ?? transfer.amount,
      nonce: tx.nonce ?? messageId,
    };
    context.Transaction.set(updated);
  }
}
);
