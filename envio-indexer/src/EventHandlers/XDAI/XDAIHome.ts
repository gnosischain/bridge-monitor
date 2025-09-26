import { Validator, XDAIHome, TransactionValidation } from "generated";
import { TransactionStatusEnum, BridgeTypeEnum, CHAIN } from "../../const";
import { combineNonceAndChainId } from "../../utils/combineNonceAndChainId";
import { getValidator } from "../../utils/getValidator";
import { stringify } from "../../utils/stringify";

XDAIHome.SignedForAffirmation.handler(async ({ event, context }) => {
  const foreignNonce = event.params.nonce;
  const txId = foreignNonce.startsWith("0x00000000")
    ? combineNonceAndChainId(foreignNonce, CHAIN.FOREIGN.ID)
    : foreignNonce;

  context.log.info(`2 XDAI: SignedForAffirmation - looking for tx: ${txId}`);
  const tx = await context.Transaction.get(txId);
  if (!tx) {
    context.log.info(`2 XDAI: SignedForAffirmation - tx not found - creating new tx`);
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
    context.log.info(`2 XDAI: SignedForAffirmation - tx found - updating tx ${stringify(tx)}`);
    const newTx = { ...tx, transactionStatus: TransactionStatusEnum.COLLECTING };
    context.log.info(`2 XDAI: SignedForAffirmation - updating tx ${stringify(newTx)}`);
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
