import { Validator, XDAIHome, TransactionValidation, TransactionExecution } from "generated";
import { TransactionStatusEnum, BridgeTypeEnum, CHAIN } from "../../const";
import { combineNonceAndChainId } from "../../utils/combineNonceAndChainId";
import { getValidator } from "../../utils/getValidator";

XDAIHome.SignedForAffirmation.handler(async ({ event, context }) => {
  const foreignNonce = event.params.nonce;
  const txId = foreignNonce.startsWith("0x00000000")
    ? combineNonceAndChainId(foreignNonce, CHAIN.FOREIGN.ID)
    : foreignNonce;

  const tx = await context.Transaction.get(txId);
  if (!tx) {
    const newTx = {
      id: txId,
      bridgeType: BridgeTypeEnum.XDAI,
      execution_id: undefined,
      transactionStatus: TransactionStatusEnum.COLLECTING,
      messageId: txId,
      nonce: foreignNonce,

      initiatorNetwork: CHAIN.FOREIGN.ID,    
      receiverNetwork: CHAIN.HOME.ID,

      initiator: undefined,
      initiatorToken: undefined,
      initiatorAmount: undefined,

      receiver: undefined,
      receiverToken: undefined,
      receiverAmount: undefined,

      timestamp: undefined,
      transactionHash: undefined,
    }
  
    context.Transaction.set({...newTx});
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

XDAIHome.AffirmationCompleted.handler(async ({ event, context }) => {
  const foreignNonce = event.params.nonce;
  const txId = foreignNonce.startsWith("0x00000000")
    ? combineNonceAndChainId(foreignNonce, CHAIN.FOREIGN.ID)
    : foreignNonce;

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

  const tx = await context.Transaction.get(txId);
  if (!tx) {
    context.log.error(
      `XDAI: AffirmationCompleted - Transaction not found, nonce: ${foreignNonce}`
    );
    return;
  }

  const execution: TransactionExecution = {
    id: txId,
    transaction_id: txId,
    transactionHash: event.transaction.hash,
    timestamp: BigInt(event.block.timestamp),
    executor_id: validator.id,
    executorAddress: validator.address,
  };
  context.TransactionExecution.set(execution);

  context.Transaction.set({
    ...tx,
    transactionStatus: TransactionStatusEnum.COMPLETED,
    execution_id: execution.id,
  });
});
