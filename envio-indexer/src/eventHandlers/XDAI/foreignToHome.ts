import { DAI, TransactionExecution, TransactionValidation, Validator, XDAIForeign, XDAIHome, USDS } from "generated";
import { BridgeTypeEnum, CHAIN, TransactionStatusEnum } from "../../const";
import { combineNonceAndChainId } from "../../utils/combineNonceAndChainId";
// import { getInitiatorFromReceipt } from "../../effects/getInitiatorFromReceipt";
import { ADDRESSES } from "../../addresses";
import { getValidator } from "../../utils/getValidator";

// [Foreign]
// 0. DAI transfer, to keep sender and sender token
DAI.Transfer.handler(async ({ event, context }) => {
  const txHash = event.transaction.hash;
  const sender = event.params.from;

  const tx = await context.DaiOrUsdsTransfer.get(txHash);
  if (!tx) {
    const newTx = {
      id: txHash,
      transactionHash: txHash,
      sender: sender,
      token: event.srcAddress
    };
    context.DaiOrUsdsTransfer.set(newTx);
  }
}, {
  eventFilters: [
    {to: ADDRESSES.FOREIGN.XDAI_BRIDGE },
    {to: ADDRESSES.FOREIGN.XDAI_BRIDGE_PERIPHERAL_FOR_DAI_PRE_USDS_UPGRADE_ADDRESS },
    {to: ADDRESSES.FOREIGN.BRIDGE_ROUTER },
  ]
});

// [Foreign]
// 0. USDS transfer, to keep sender and sender token
USDS.Transfer.handler(async ({ event, context }) => {
  const txHash = event.transaction.hash;
  const sender = event.params.from;

  const tx = await context.DaiOrUsdsTransfer.get(txHash);
  if (!tx) {
    const newTx = {
      id: txHash,
      transactionHash: txHash,
      sender: sender,
      token: event.srcAddress,
    };
    context.DaiOrUsdsTransfer.set(newTx);
  }
}, {
  eventFilters: [
    {to: ADDRESSES.FOREIGN.XDAI_BRIDGE },
    {to: ADDRESSES.FOREIGN.XDAI_BRIDGE_PERIPHERAL_FOR_DAI_PRE_USDS_UPGRADE_ADDRESS },
    {to: ADDRESSES.FOREIGN.BRIDGE_ROUTER },
  ]
});

// [Foreign]
// 1 Init. Bridging started
// Before Hashi update
XDAIForeign.UserRequestForAffirmation_NoNonce.handler(async ({ event, context }) => {
  const txHash = event.transaction.hash;
  
  // const res = await context.effect(getInitiatorFromReceipt, { hash: txHash });
  // if (!res) return;
  // const { initiator, initiatorToken } = res;
  // if (!initiator || !initiatorToken) return;

  const transferTx = await context.DaiOrUsdsTransfer.get(txHash);
  if (!transferTx) {
    return;
  }
  const { sender: initiator, token: initiatorToken } = transferTx;
  if (!initiator || !initiatorToken) return;

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

      initiatorNetwork: CHAIN.FOREIGN.ID,
      initiator,
      initiatorToken,
      initiatorAmount: event.params.value,
      
      receiverNetwork: CHAIN.HOME.ID,
      receiver: event.params.recipient,
      receiverToken: ADDRESSES.HOME.XDAI_TOKEN,
      receiverAmount: event.params.value,
    }
  
    context.Transaction.set(newTx);
  } else {
    return;
    // const updatedTx = {
    //   ...tx,
    //   id: txHash,
    //   bridgeType: BridgeTypeEnum.XDAI,
    //   messageId: txHash,
    //   nonce: txHash,
    //   transactionHash: event.transaction.hash,
    //   timestamp: BigInt(event.block.timestamp),

    //   initiatorNetwork: CHAIN.FOREIGN.ID,
    //   initiator,
    //   initiatorToken,
    //   initiatorAmount: event.params.value,
      
    //   receiverNetwork: CHAIN.HOME.ID,
    //   receiver: event.params.recipient,
    //   receiverToken: ADDRESSES.HOME.XDAI_TOKEN,
    //   receiverAmount: event.params.value
    // }
    // context.Transaction.set(updatedTx);
  }

});

// [Foreign]
// 1 Init. Bridging started
// After Hashi update (current version)
XDAIForeign.UserRequestForAffirmation.handler(async ({ event, context }) => {
  const txHash = event.transaction.hash;

  // const res = await context.effect(getInitiatorFromReceipt, { hash: txHash });
  // if (!res || res.initiator === '' || res.initiatorToken === '') return;
  // const { initiator, initiatorToken } = res;
  // if (!initiator || !initiatorToken) return;

  const transferTx = await context.DaiOrUsdsTransfer.get(txHash);
  if (!transferTx) {
    return;
  }
  const { sender: initiator, token: initiatorToken } = transferTx;
  if (!initiator || !initiatorToken) return;

  const nonce = event.params.nonce;
  const nonceWithChainId = combineNonceAndChainId(nonce, CHAIN.FOREIGN.ID);
  
  const tx = await context.Transaction.get(nonceWithChainId);
  if (!tx) {
    const newTx = {
      id: nonceWithChainId,
      bridgeType: BridgeTypeEnum.XDAI,
      execution_id: undefined,
      transactionStatus: TransactionStatusEnum.INITIATED,
      messageId: nonceWithChainId,
      nonce,
      transactionHash: event.transaction.hash,
      timestamp: BigInt(event.block.timestamp),

      initiatorNetwork: CHAIN.FOREIGN.ID,
      initiator,
      initiatorToken,
      initiatorAmount: event.params.value,
      
      receiverNetwork: CHAIN.HOME.ID,
      receiver: event.params.recipient,
      receiverToken: ADDRESSES.HOME.XDAI_TOKEN,
      receiverAmount: event.params.value,
    }
  
    context.Transaction.set(newTx);
  } else {
    return;
    // const updatedTx = {
    //   ...tx,
    //   id: nonceWithChainId,
    //   bridgeType: BridgeTypeEnum.XDAI,
    //   messageId: nonceWithChainId,
    //   nonce,
    //   transactionHash: event.transaction.hash,
    //   timestamp: BigInt(event.block.timestamp),

    //   initiatorNetwork: CHAIN.FOREIGN.ID,
    //   initiator,
    //   initiatorToken,
    //   initiatorAmount: event.params.value,
      
    //   receiverNetwork: CHAIN.HOME.ID,
    //   receiver: event.params.recipient,
    //   receiverToken: ADDRESSES.HOME.XDAI_TOKEN,
    //   receiverAmount: event.params.value
    // }
    // context.Transaction.set(updatedTx);
  }
});

// [Home]
// 2 Validation. Validators sign transaction
XDAIHome.SignedForAffirmation.handler(async ({ event, context }) => {
  const foreignNonce = event.params.nonce;
  const txId = foreignNonce.startsWith("0x00000000")
    ? combineNonceAndChainId(foreignNonce, CHAIN.FOREIGN.ID)
    : foreignNonce;

  const tx = await context.Transaction.get(txId);
  if (!tx) {
    return;
    // const newTx = {
    //   id: txId,
    //   bridgeType: BridgeTypeEnum.XDAI,
    //   execution_id: undefined,
    //   transactionStatus: TransactionStatusEnum.COLLECTING,
    //   messageId: txId,
    //   nonce: foreignNonce,

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
    const newTx = { ...tx, transactionStatus: TransactionStatusEnum.COLLECTING };
    context.Transaction.set({...newTx});
  }

  const signer = event.params.signer.toLowerCase();
  const validator = await getValidator(context, signer);
  if (!validator) {
    context.log.error(`XDAI: SignedForAffirmation - Validator ${signer} not found, nonce: ${foreignNonce}`);
    return;
  }
  const updatedValidator: Validator = { ...validator, lastActivity: BigInt(event.block.timestamp) };
  context.Validator.set(updatedValidator);

  const validationId = `${txId}-${signer}`;
  const validation: TransactionValidation = {
    id: validationId,
    transaction_id: txId,
    validator_id: signer,
    validatorAddress: signer,
    transactionHash: event.transaction.hash,
    timestamp: BigInt(event.block.timestamp),
  };
  context.TransactionValidation.set(validation);
});

// [Home]
// 3 Execution. Validator executes transaction
XDAIHome.AffirmationCompleted.handler(async ({ event, context }) => { 
  const foreignNonce = event.params.nonce;
  const txId = foreignNonce.startsWith("0x00000000")
    ? combineNonceAndChainId(foreignNonce, CHAIN.FOREIGN.ID)
    : foreignNonce;

  // const executor = event.transaction.from?.toLowerCase();
  // if (!executor) {
  //   context.log.error(
  //     `XDAI: AffirmationCompleted - Executor not found, nonce: ${foreignNonce}`
  //   );
  //   return;
  // }
  // const validator = await getValidator(context, executor);
  // if (!validator) {
  //   context.log.error(
  //     `XDAI: AffirmationCompleted - Validator ${executor} not found, nonce: ${foreignNonce}`
  //   );
  //   return;
  // }
  // context.Validator.set({ ...validator, lastActivity: BigInt(event.block.timestamp) });

  // const execution: TransactionExecution = {
  //   id: `${txId}-${validator.id}`,
  //   transaction_id: txId,
  //   transactionHash: event.transaction.hash,
  //   timestamp: BigInt(event.block.timestamp),
  //   executor_id: validator.id,
  //   executorAddress: validator.address,
  // };
  // context.TransactionExecution.set(execution);

  const tx = await context.Transaction.get(txId);
  if (!tx) {
    return;
    // const newTx = {
    //   id: txId,
    //   bridgeType: BridgeTypeEnum.XDAI,
    //   execution_id: execution.id,
    //   transactionStatus: TransactionStatusEnum.COMPLETED,
    //   messageId: txId,
    //   nonce: foreignNonce,

    //   initiatorNetwork: CHAIN.FOREIGN.ID,    
    //   receiverNetwork: CHAIN.HOME.ID,

    //   initiator: undefined,
    //   initiatorToken: undefined,
    //   initiatorAmount: undefined,

    //   receiver: undefined,
    //   receiverToken: ADDRESSES.HOME.XDAI_TOKEN,
    //   receiverAmount: undefined,

    //   timestamp: undefined,
    //   transactionHash: undefined,
    // }
    // context.Transaction.set({...newTx});
  } else {
    const executor = event.transaction.from?.toLowerCase();
    if (!executor) {
      context.log.error(
        `XDAI: AffirmationCompleted - Executor not found, nonce: ${foreignNonce}`
      );
      return;
    }
    const validator = await getValidator(context, executor);
    if (!validator) {
      context.log.error(
        `XDAI: AffirmationCompleted - Validator ${executor} not found, nonce: ${foreignNonce}`
      );
      return;
    }
    context.Validator.set({ ...validator, lastActivity: BigInt(event.block.timestamp) });

    const execution: TransactionExecution = {
      id: `${txId}-${validator.id}`,
      transaction_id: txId,
      transactionHash: event.transaction.hash,
      timestamp: BigInt(event.block.timestamp),
      executor_id: validator.id,
      executorAddress: validator.address,
    };
    context.TransactionExecution.set(execution);
    const newTx = {
      ...tx,
      transactionStatus: TransactionStatusEnum.COMPLETED,
      execution_id: execution.id,
    };
    context.Transaction.set({...newTx});
  }
});
