import { indexer, TransactionExecution, TransactionValidation, Validator, XDAIHome, XDAIForeign } from "envio";
import { BridgeTypeEnum, CHAIN, TransactionStatusEnum } from "../../const";
import { ADDRESSES } from "../../addresses";
import { combineNonceAndChainId } from "../../utils/combineNonceAndChainId";
import { getValidator } from "../../utils/getValidator";
import { getHomeNonceOrTxHashFromMessageMethod } from "../../utils/getHomeNonceOrTxHashFromMessageMethod";
import { decodeFunctionData, parseAbiItem } from 'viem'

/**
 * XDAI Home -> Foreign (GC -> ETH)
 * Flow:
 * 1) Home XDAI: UserRequestForSignature (three variants over time)
 *    - NoNonce/NoToken (legacy) => INITIATED Transaction using txHash as id
 *    - WithNonce/NoToken (post-Hashi) => INITIATED using nonce + chainId as id
 *    - WithNonce/Token (current) => INITIATED using nonce + chainId, token from event
 * 2) Home XDAI: SignedForUserRequest => COLLECTING + persist validator signature (recover messageId via message(messageHash))
 * 3) Home XDAI: CollectedSignatures => UNCLAIMED (ready to execute on Foreign)
 * 4) Foreign XDAI: RelayedMessage => create TransactionExecution and COMPLETE the Transaction
 */

// [Home]
// 1 Init. DAI is transferred to the bridge contract
// Before Hashi update
indexer.onEvent(
  { contract: "XDAIHome", event: "UserRequestForSignature_NoNonceNoToken" },
  async ({ event, context }) => {
  const txHash = event.transaction.hash;
  const tx = await context.Transaction.get(txHash);
  if (!tx) {
    const newTx = {
      id: txHash,
      bridgeType: BridgeTypeEnum.XDAI,
      execution_id: undefined,
      transactionStatus: TransactionStatusEnum.INITIATED,
      messageId: txHash,
      nonce: txHash,
      transactionHash: event.transaction.hash,
      timestamp: BigInt(event.block.timestamp),

      initiatorNetwork: CHAIN.HOME.ID,
      initiator: event.transaction.from?.toLowerCase(),
      initiatorToken: ADDRESSES.HOME.XDAI_TOKEN,
      initiatorAmount: event.params.value,
      
      receiverNetwork: CHAIN.FOREIGN.ID,
      receiver: event.params.recipient?.toLowerCase(),
      receiverToken: ADDRESSES.FOREIGN.DAI_TOKEN,
      receiverAmount: event.params.value,
    }
    context.Transaction.set(newTx);
  } else {
    const updatedTx = {
      ...tx,
      id: txHash,
      bridgeType: BridgeTypeEnum.XDAI,
      messageId: txHash,
      nonce: txHash,
      transactionHash: event.transaction.hash,
      timestamp: BigInt(event.block.timestamp),

      initiatorNetwork: CHAIN.HOME.ID,
      initiator: event.transaction.from?.toLowerCase(),
      initiatorToken: ADDRESSES.HOME.XDAI_TOKEN,
      initiatorAmount: event.params.value,
      
      receiverNetwork: CHAIN.FOREIGN.ID,
      receiver: event.params.recipient?.toLowerCase(),
      receiverToken: ADDRESSES.FOREIGN.DAI_TOKEN,
      receiverAmount: event.params.value
    }
    context.Transaction.set(updatedTx);
  }
}
);

// 1 Init. DAI is transferred to the bridge contract
// After Hashi update
indexer.onEvent(
  { contract: "XDAIHome", event: "UserRequestForSignature_WithNonceNoToken" },
  async ({ event, context }) => {
  const nonce = event.params.nonce;
  const nonceAndChainId = combineNonceAndChainId(nonce, 100);

  const tx = await context.Transaction.get(nonceAndChainId);
  if (!tx) {
    const newTx = {
      id: nonceAndChainId,
      bridgeType: BridgeTypeEnum.XDAI,
      execution_id: undefined,
      transactionStatus: TransactionStatusEnum.INITIATED,
      messageId: nonceAndChainId,
      nonce: nonce,
      transactionHash: event.transaction.hash,
      timestamp: BigInt(event.block.timestamp),

      initiatorNetwork: CHAIN.HOME.ID,
      initiator: event.transaction.from?.toLowerCase(),
      initiatorToken: ADDRESSES.HOME.XDAI_TOKEN,
      initiatorAmount: event.params.value,
      
      receiverNetwork: CHAIN.FOREIGN.ID,
      receiver: event.params.recipient?.toLowerCase(),
      receiverToken: ADDRESSES.FOREIGN.DAI_TOKEN,
      receiverAmount: event.params.value,
    }
    context.Transaction.set(newTx);
  } else {
    const updatedTx = {
      ...tx,
      id: nonceAndChainId,
      bridgeType: BridgeTypeEnum.XDAI,
      messageId: nonceAndChainId,
      nonce: nonce,
      transactionHash: event.transaction.hash,
      timestamp: BigInt(event.block.timestamp),

      initiatorNetwork: CHAIN.HOME.ID,
      initiator: event.transaction.from?.toLowerCase(),
      initiatorToken: ADDRESSES.HOME.XDAI_TOKEN,
      initiatorAmount: event.params.value,
      
      receiverNetwork: CHAIN.FOREIGN.ID,
      receiver: event.params.recipient?.toLowerCase(),
      receiverToken: ADDRESSES.FOREIGN.DAI_TOKEN,
      receiverAmount: event.params.value
    }
    context.Transaction.set(updatedTx);
  }
}
);

// 1 Init. DAI is transferred to the bridge contract
// After USDS migration (current version)
indexer.onEvent(
  { contract: "XDAIHome", event: "UserRequestForSignature" },
  async ({ event, context }) => {
  const nonce = event.params.nonce;
  const nonceAndChainId = combineNonceAndChainId(nonce, 100);

  const tx = await context.Transaction.get(nonceAndChainId);
  if (!tx) {
    const newTx = {
      id: nonceAndChainId,
      bridgeType: BridgeTypeEnum.XDAI,
      execution_id: undefined,
      transactionStatus: TransactionStatusEnum.INITIATED,
      messageId: nonceAndChainId,
      nonce: nonce,
      transactionHash: event.transaction.hash,
      timestamp: BigInt(event.block.timestamp),

      initiatorNetwork: CHAIN.HOME.ID,
      initiator: event.transaction.from?.toLowerCase(),
      initiatorToken: ADDRESSES.HOME.XDAI_TOKEN,
      initiatorAmount: event.params.value,
      
      receiverNetwork: CHAIN.FOREIGN.ID,
      receiver: event.params.recipient?.toLowerCase(),
      receiverToken: event.params.token,
      receiverAmount: event.params.value,
    }
    context.Transaction.set(newTx);
  } else {
    const updatedTx = {
      ...tx,
      id: nonceAndChainId,
      bridgeType: BridgeTypeEnum.XDAI,
      messageId: nonceAndChainId,
      nonce: nonce,
      transactionHash: event.transaction.hash,
      timestamp: BigInt(event.block.timestamp),

      initiatorNetwork: CHAIN.HOME.ID,
      initiator: event.transaction.from?.toLowerCase(),
      initiatorToken: ADDRESSES.HOME.XDAI_TOKEN,
      initiatorAmount: event.params.value,
      
      receiverNetwork: CHAIN.FOREIGN.ID,
      receiver: event.params.recipient?.toLowerCase(),
      receiverToken: event.params.token,
      receiverAmount: event.params.value
    }
    context.Transaction.set(updatedTx);
  }
}
);

// [Home]
// 2 Validation. Validators sign transaction
indexer.onEvent(
  { contract: "XDAIHome", event: "SignedForUserRequest" },
  async ({ event, context }) => {

  const rawInput = event.transaction.input as `0x${string}`;
  const { functionName, args } = decodeFunctionData({
    abi: [parseAbiItem("function submitSignature(bytes signature, bytes message)")],
    data: rawInput
  })
  const message = args[1];

  if (!message) {
    context.log.error(`XDAI Home: SignedForUserRequest Not found message for txHash: ${event.transaction.hash} and messageHash: ${event.params.messageHash}`);
    return;
  };

  const xDaiNonceOrTxHash = getHomeNonceOrTxHashFromMessageMethod(message);
  const messageId = xDaiNonceOrTxHash.startsWith("0x00000000") ? combineNonceAndChainId(xDaiNonceOrTxHash, CHAIN.HOME.ID) : xDaiNonceOrTxHash;

  const tx = await context.Transaction.get(messageId);
  if (!tx) {
    context.log.error(`XDAI Home: SignedForUserRequest Not found tx for messageId: ${messageId}`);
    return;
  } else {
    const updatedTx = { ...tx, transactionStatus: TransactionStatusEnum.COLLECTING };
    
    context.Transaction.set({...updatedTx});
  }

  const signer = event.params.signer.toLowerCase();
  const validator = await getValidator(context, signer, BridgeTypeEnum.XDAI);
  if (!validator) {
    context.log.error(`XDAI Home: SignedForUserRequest - Validator ${signer} not found, nonce: ${xDaiNonceOrTxHash}, txHash: ${event.transaction.hash}`);
    return;
  }

  const updatedValidator: Validator = { ...validator, lastActivity: BigInt(event.block.timestamp) };
  context.Validator.set(updatedValidator);

  const validationId = `${messageId}-${signer}`;
  const validation: TransactionValidation = {
    id: validationId,
    transaction_id: messageId,
    validator_id: validator.id,
    validatorAddress: signer,
    transactionHash: event.transaction.hash,
    timestamp: BigInt(event.block.timestamp),
  };
  context.TransactionValidation.set(validation);
}
);

// [Home]
// 3 Ready to execute on Foreign (treshold signatures reached)
// When this event happens, is possible to claim the tokens on the foreign network.
indexer.onEvent(
  { contract: "XDAIHome", event: "CollectedSignatures" },
  async ({ event, context }) => {

  const rawInput = event.transaction.input as `0x${string}`;
  const { functionName, args } = decodeFunctionData({
    abi: [parseAbiItem("function submitSignature(bytes signature, bytes message)")],
    data: rawInput
  })
  const message = args[1];

  const xDaiNonceOrTxHash = getHomeNonceOrTxHashFromMessageMethod(message);
  const messageId = xDaiNonceOrTxHash.startsWith("0x00000000") ? combineNonceAndChainId(xDaiNonceOrTxHash, CHAIN.HOME.ID) : xDaiNonceOrTxHash;

  const tx = await context.Transaction.get(messageId);

  if (!tx) {
    context.log.error(`XDAI Home: CollectedSignatures Not found tx for messageId: ${messageId}`);
    return;
  } else {
    if (tx.transactionStatus !== TransactionStatusEnum.COMPLETED) {
      const updatedTx = {
        ...tx,
        transactionStatus: TransactionStatusEnum.UNCLAIMED,
      };
      context.Transaction.set(updatedTx);
    }
  }
}
);

// [Foreign]
// 4 Execution (token claimed)
indexer.onEvent(
  { contract: "XDAIForeign", event: "RelayedMessage" },
  async ({ event, context }) => {
  const txHashOrNonce = event.params.transactionHash;
  const messageId = txHashOrNonce.startsWith("0x00000000")
    ? combineNonceAndChainId(txHashOrNonce, CHAIN.HOME.ID)
    : txHashOrNonce

  const tx = await context.Transaction.get(messageId);
  if (!tx) {
    context.log.error(`XDAI Foreign: RelayedMessage Not found tx for messageId: ${messageId}`);
    return;
  } else {
    const executionId = messageId;

    // Populate executor as tx.from and resolve to known validator when possible
    const executor = event.transaction.from?.toLowerCase();
    let executorId: string | undefined = undefined;
    let executorAddress: string | undefined = undefined;

    if (executor) {
      const validator = await getValidator(context, executor, BridgeTypeEnum.XDAI);
      if (validator) {
        context.Validator.set({ ...validator, lastActivity: BigInt(event.block.timestamp) });
        executorId = validator.id;
        executorAddress = validator.address;
      } else {
        // claiming can be done by anyone
        executorAddress = executor;
      }
    }

    const execution: TransactionExecution = {
      id: executionId,
      transaction_id: messageId,
      transactionHash: event.transaction.hash,
      timestamp: BigInt(event.block.timestamp),
      executor_id: executorId,
      executorAddress: executorAddress,
    };
    context.TransactionExecution.set(execution);

    const updatedTx = {
      ...tx,
      transactionStatus: TransactionStatusEnum.COMPLETED,
      execution_id: executionId,
      // Ensure receiver side (mainnet) info remains populated; set network if missing
      receiverNetwork: tx.receiverNetwork ?? CHAIN.FOREIGN.ID,
    };
    context.Transaction.set(updatedTx);
  }
}
);
