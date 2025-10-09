import { TransactionExecution, TransactionValidation, Validator, XDAIHome, XDAIForeign } from "generated";
import { BridgeTypeEnum, CHAIN, TransactionStatusEnum } from "../../const";
import { ADDRESSES } from "../../addresses";
import { combineNonceAndChainId } from "../../utils/combineNonceAndChainId";
import { getValidator } from "../../utils/getValidator";
import { getHomeMessageByHash } from "../../effects/getHomeMessageByHash";
import { getHomeNonceOrTxHashFromMessageMethod } from "../../utils/getHomeNonceOrTxHashFromMessageMethod";

// [Home]
// 1 Init. DAI is transferred to the bridge contract
// Before Hashi update
XDAIHome.UserRequestForSignature_NoNonceNoToken.handler(async ({ event, context }) => {
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
      initiator: event.transaction.from,
      initiatorToken: ADDRESSES.HOME.XDAI_TOKEN,
      initiatorAmount: event.params.value,
      
      receiverNetwork: CHAIN.FOREIGN.ID,
      receiver: event.params.recipient,
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
      initiator: event.transaction.from,
      initiatorToken: ADDRESSES.HOME.XDAI_TOKEN,
      initiatorAmount: event.params.value,
      
      receiverNetwork: CHAIN.FOREIGN.ID,
      receiver: event.params.recipient,
      receiverToken: ADDRESSES.FOREIGN.DAI_TOKEN,
      receiverAmount: event.params.value
    }
    context.Transaction.set(updatedTx);
  }
});

// 1 Init. DAI is transferred to the bridge contract
// After Hashi update
XDAIHome.UserRequestForSignature_WithNonceNoToken.handler(async ({ event, context }) => {
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
      initiator: event.transaction.from,
      initiatorToken: ADDRESSES.HOME.XDAI_TOKEN,
      initiatorAmount: event.params.value,
      
      receiverNetwork: CHAIN.FOREIGN.ID,
      receiver: event.params.recipient,
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
      initiator: event.transaction.from,
      initiatorToken: ADDRESSES.HOME.XDAI_TOKEN,
      initiatorAmount: event.params.value,
      
      receiverNetwork: CHAIN.FOREIGN.ID,
      receiver: event.params.recipient,
      receiverToken: ADDRESSES.FOREIGN.DAI_TOKEN,
      receiverAmount: event.params.value
    }
    context.Transaction.set(updatedTx);
  }
});

// 1 Init. DAI is transferred to the bridge contract
// After USDS migration (current version)
XDAIHome.UserRequestForSignature.handler(async ({ event, context }) => {
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
      initiator: event.transaction.from,
      initiatorToken: ADDRESSES.HOME.XDAI_TOKEN,
      initiatorAmount: event.params.value,
      
      receiverNetwork: CHAIN.FOREIGN.ID,
      receiver: event.params.recipient,
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
      initiator: event.transaction.from,
      initiatorToken: ADDRESSES.HOME.XDAI_TOKEN,
      initiatorAmount: event.params.value,
      
      receiverNetwork: CHAIN.FOREIGN.ID,
      receiver: event.params.recipient,
      receiverToken: event.params.token,
      receiverAmount: event.params.value
    }
    context.Transaction.set(updatedTx);
  }
});

// [Home]
// 2 Validation. Validators sign transaction
XDAIHome.SignedForUserRequest.handler(async ({ event, context }) => {

  // on 1. we create the transaction entity with the txHash as id
  // When a validator signs the transaction, the txHash used as id on 1 is not emitted.
  // We need to recover it by querying the xDai.message(messageHash) bridge contract method
  // using the messageHash emitted in this event.
  const message = await context.effect(getHomeMessageByHash, {
    address: event.srcAddress,
    messageHash: event.params.messageHash,
  });
  if (!message) return;

  const xDaiNonceOrTxHash = getHomeNonceOrTxHashFromMessageMethod(message);
  const messageId = xDaiNonceOrTxHash.startsWith("0x00000000") ? combineNonceAndChainId(xDaiNonceOrTxHash, CHAIN.HOME.ID) : xDaiNonceOrTxHash;

  const tx = await context.Transaction.get(messageId);
  if (!tx) {
    return;
    // const newTx = {
    //   id: messageId,
    //   bridgeType: BridgeTypeEnum.XDAI,
    //   execution_id: undefined,
    //   transactionStatus: TransactionStatusEnum.COLLECTING,
    //   messageId: messageId,
    //   nonce: xDaiNonceOrTxHash,

    //   initiatorNetwork: CHAIN.FOREIGN.ID,    
    //   receiverNetwork: CHAIN.HOME.ID,

    //   initiator: undefined,
    //   initiatorToken: undefined,
    //   initiatorAmount: undefined,

    //   receiver: undefined,
    //   receiverToken: undefined,
    //   receiverAmount: undefined,

    //   timestamp: undefined,
    //   transactionHash: undefined,
    // }
    // context.Transaction.set({...newTx});
  } else {
    const updatedTx = { ...tx, transactionStatus: TransactionStatusEnum.COLLECTING };
    
    context.Transaction.set({...updatedTx});
  }

  const signer = event.params.signer.toLowerCase();
  const validator = await getValidator(context, signer);
  if (!validator) {
    context.log.error(`XDAI Home: SignedForUserRequest - Validator ${signer} not found, nonce: ${xDaiNonceOrTxHash}`);
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
});

// [Home]
// 3 Ready to execute on Foreign (treshold signatures reached)
// When this event happens, is possible to claim the tokens on the foreign network.
XDAIHome.CollectedSignatures.handler(async ({ event, context }) => {
  // on 1. we create the transaction entity with the txHash as id
  // When a validator signs the transaction, the txHash used as id on 1 is not emitted.
  // We need to recover it by querying the xDai.message(messageHash) bridge contract method
  // using the messageHash emitted in this event.
  const message = await context.effect(getHomeMessageByHash, {
    address: event.srcAddress,
    messageHash: event.params.messageHash,
  });
  if (!message) return;

  const xDaiNonceOrTxHash = getHomeNonceOrTxHashFromMessageMethod(message);
  const messageId = xDaiNonceOrTxHash.startsWith("0x00000000") ? combineNonceAndChainId(xDaiNonceOrTxHash, CHAIN.HOME.ID) : xDaiNonceOrTxHash;

  const tx = await context.Transaction.get(messageId);

  if (!tx) {
    return;
    // const newTx = {
    //   id: messageId,
    //   bridgeType: BridgeTypeEnum.XDAI,
    //   execution_id: undefined,
    //   transactionStatus: TransactionStatusEnum.UNCLAIMED,
    //   messageId: messageId,
    //   nonce: xDaiNonceOrTxHash,

    //   initiatorNetwork: CHAIN.HOME.ID,    
    //   receiverNetwork: CHAIN.FOREIGN.ID,

    //   initiator: undefined,
    //   initiatorToken: undefined,
    //   initiatorAmount: undefined,

    //   receiver: undefined,
    //   receiverToken: undefined,
    //   receiverAmount: undefined,

    //   timestamp: undefined,
    //   transactionHash: undefined,
    // }
    // context.Transaction.set({...newTx});
  } else {
    if (tx.transactionStatus !== TransactionStatusEnum.COMPLETED) {
      const updatedTx = {
        ...tx,
        transactionStatus: TransactionStatusEnum.UNCLAIMED,
      };
      context.Transaction.set(updatedTx);
    }
  }
});


// [Foreign]
// 4 Execution (token claimed)
XDAIForeign.RelayedMessage.handler(async ({ event, context }) => {
  const txHashOrNonce = event.params.transactionHash;
  const messageId = txHashOrNonce.startsWith("0x00000000")
    ? combineNonceAndChainId(txHashOrNonce, CHAIN.HOME.ID)
    : txHashOrNonce

  // const executionId = messageId;
  // const execution: TransactionExecution = {
  //   id: executionId,
  //   transaction_id: messageId,
  //   transactionHash: event.transaction.hash,
  //   timestamp: BigInt(event.block.timestamp),
  //   executor_id: undefined,
  //   executorAddress: undefined,
  // };
  // context.TransactionExecution.set(execution);

  const tx = await context.Transaction.get(messageId);
  if (!tx) {
    return;
    // const newTx = {
    //   id: messageId,
    //   bridgeType: BridgeTypeEnum.XDAI,
    //   execution_id: executionId,
    //   transactionStatus: TransactionStatusEnum.COMPLETED,
    //   messageId: messageId,
    //   nonce: txHashOrNonce,

    //   initiatorNetwork: CHAIN.HOME.ID,    
    //   receiverNetwork: CHAIN.FOREIGN.ID,

    //   initiator: undefined,
    //   initiatorToken: undefined,
    //   initiatorAmount: undefined,

    //   receiver: undefined,
    //   receiverToken: undefined,
    //   receiverAmount: undefined,

    //   timestamp: undefined,
    //   transactionHash: undefined,
    // }
    // context.Transaction.set({...newTx});
  } else {
    const executionId = messageId;

    // Populate executor as tx.from and resolve to known validator when possible
    const executor = event.transaction.from?.toLowerCase();
    let executorId: string | undefined = undefined;
    let executorAddress: string | undefined = undefined;

    if (executor) {
      const validator = await getValidator(context, executor);
      if (validator) {
        context.Validator.set({ ...validator, lastActivity: BigInt(event.block.timestamp) });
        executorId = validator.id;
        executorAddress = validator.address;
      } else {
        // not a known validator from config; still record the executor address
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
});
