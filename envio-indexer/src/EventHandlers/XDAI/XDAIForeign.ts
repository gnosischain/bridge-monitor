import { XDAIForeign, Transaction } from "generated";
import { BridgeTypeEnum, CHAIN, TransactionStatusEnum, TransactionStatusLiteral } from "../../const";
import { combineNonceAndChainId } from "../../utils/combineNonceAndChainId";
import { getInitiatorFromReceipt } from "../../effects/getInitiatorFromReceipt";
import { ADDRESSES } from "../../addresses";
import { stringify } from "../../utils/stringify";

// XDAIForeign.RelayedMessage.handler(async ({ event, context }) => {
//   const entity: XDAITransaction = {
//     id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
//     receiver: event.params.recipient,
//     value: event.params.value,
//     transactionHash: event.params.transactionHash,
//   };

//   context.XDAITransaction.set(entity);
// });

const receiptCache = new Map<string, { sender: string; token: string }>();


XDAIForeign.UserRequestForAffirmation.handler(async ({ event, context }) => {
  if (context.isPreload) return;

  const txHash = event.transaction.hash;
  let cached = receiptCache.get(txHash);
  if (!cached) {
    const res = await context.effect(getInitiatorFromReceipt, { hash: txHash });
    if (res) {
      const [sender, token] = res;
      cached = { sender, token };
      receiptCache.set(txHash, cached);
    }
  }

  const initiator = cached?.sender;
  const initiatorToken = cached?.token;

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
    const updatedTx = {
      ...tx,
      id: nonceWithChainId,
      bridgeType: BridgeTypeEnum.XDAI,
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
      receiverAmount: event.params.value
    }
    context.Transaction.set(updatedTx);
  }
});