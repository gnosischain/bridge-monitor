import { DAI, TransactionExecution, TransactionValidation, Validator, XDAIForeign, XDAIHome, USDS } from "generated";
import { BridgeTypeEnum, CHAIN, TransactionStatusEnum } from "../../const";
import { combineNonceAndChainId } from "../../utils/combineNonceAndChainId";
import { ADDRESSES } from "../../addresses";
import { getValidator } from "../../utils/getValidator";

/**
 * XDAI Foreign -> Home (ETH -> GC)
 * Flow:
 * 0) Foreign ERC20 Transfer (DAI/USDS) — capture sender/token for later enrichment
 * 1) Foreign XDAI: UserRequestForAffirmation (pre- and post-Hashi) => INITIATED Transaction
 *    - Pre-Hashi: txHash as id
 *    - Post-Hashi: use nonce + chainId as id
 * 2) Home XDAI: SignedForAffirmation => set Transaction to COLLECTING and record validator signature
 * 3) Home XDAI: AffirmationCompleted => create TransactionExecution and COMPLETE the Transaction
 */

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

  // Early backfill: update Transaction if exists (pre-nonce flows use txHash as id)
  const maybeTx = await context.Transaction.get(txHash);
  if (maybeTx) {
    const updated = {
      ...maybeTx,
      initiator: maybeTx.initiator ?? sender,
      initiatorToken: maybeTx.initiatorToken ?? event.srcAddress,
      // amount is set from bridge event; do not override here
    };
    context.Transaction.set(updated);
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

  // Early backfill: update Transaction if exists (pre-nonce flows use txHash as id)
  const maybeTx = await context.Transaction.get(txHash);
  if (maybeTx) {
    const updated = {
      ...maybeTx,
      initiator: maybeTx.initiator ?? sender,
      initiatorToken: maybeTx.initiatorToken ?? event.srcAddress,
      // amount is set from bridge event; do not override here
    };
    context.Transaction.set(updated);
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

  const transferTx = await context.DaiOrUsdsTransfer.get(txHash);
  const initiator = transferTx?.sender;
  const initiatorToken = transferTx?.token;

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
  }

});

// [Foreign]
// 1 Init. Bridging started
// After Hashi update (current version)
XDAIForeign.UserRequestForAffirmation.handler(async ({ event, context }) => {
  const txHash = event.transaction.hash;

  const transferTx = await context.DaiOrUsdsTransfer.get(txHash);
  const initiator = transferTx?.sender;
  const initiatorToken = transferTx?.token;

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
    context.log.error(`XDAI Foreign: SignedForAffirmation Not found tx for nonce: ${foreignNonce}`);
    return;
  } else {
    const newTx = { ...tx, transactionStatus: TransactionStatusEnum.COLLECTING };
    context.Transaction.set({...newTx});
  }

  const signer = event.params.signer.toLowerCase();
  const validator = await getValidator(context, signer, BridgeTypeEnum.XDAI);
  if (!validator) {
    context.log.error(`XDAI: SignedForAffirmation - Validator ${signer} not found, nonce: ${foreignNonce}, tx hash: ${event.transaction.hash}`);
    return;
  }
  const updatedValidator: Validator = { ...validator, lastActivity: BigInt(event.block.timestamp) };
  context.Validator.set(updatedValidator);

  const validationId = `${txId}-${signer}`;
  const validation: TransactionValidation = {
    id: validationId,
    transaction_id: txId,
    validator_id: validator.id,
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

  const tx = await context.Transaction.get(txId);
  if (!tx) {
    context.log.error(`XDAI Foreign: AffirmationCompleted Not found tx for nonce: ${foreignNonce}`);
    return;
  } else {
    const executor = event.transaction.from?.toLowerCase();
    if (!executor) {
      context.log.error(
        `XDAI: AffirmationCompleted - Executor not found, nonce: ${foreignNonce}, tx hash: ${event.transaction.hash}`
      );
      return;
    }
    const validator = await getValidator(context, executor, BridgeTypeEnum.XDAI);
    if (!validator) {
      context.log.error(
        `XDAI: AffirmationCompleted - Validator ${executor} not found, nonce: ${foreignNonce}, tx hash: ${event.transaction.hash}`
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
