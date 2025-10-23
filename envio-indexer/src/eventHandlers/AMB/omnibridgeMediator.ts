import { OmniBridgeForeignMediator, OmniBridgeHomeMediator, ERC677BridgeHomeMediator, ERC677BridgeForeignMediator } from "generated";
import { BridgeTypeEnum, CHAIN, TransactionStatusEnum } from "../../const";
import { getTokenForBridge } from "../../utils/erc677TokenMapping";
import { toLower } from "../../utils/toLower";

// [Home] Gnosis - OmniBridge Mediator
OmniBridgeHomeMediator.TokensBridgingInitiated.handler(async ({ event, context }) => {
  const messageId = event.params.messageId;
  const token = toLower(event.params.token);
  const sender = toLower(event.params.sender);
  const amount = event.params.value;

  const existing = await context.AMBTransfer.get(messageId);
  if (!existing) {
    context.AMBTransfer.set({
      id: messageId,
      messageId,
      token: token!,
      sender: sender,
      amount,
      recipient: undefined,
    });
  } else {
    context.AMBTransfer.set({
      ...existing,
      token: token!,
      sender: sender,
      amount,
    });
  }

  // Early backfill: if Transaction exists, set initiator fields immediately
  const tx = await context.Transaction.get(messageId);
  if (tx) {
    const updated = {
      ...tx,
      initiator: tx.initiator?.toLowerCase() ?? sender?.toLowerCase(),
      initiatorToken: tx.initiatorToken?.toLowerCase() ?? token!.toLowerCase(),
      initiatorAmount: tx.initiatorAmount ?? amount,
    };
    context.Transaction.set(updated);
  } else {
    // Create Transaction early from mediator event (we have initiator + amount here)
    const newTx = {
      id: messageId,
      messageId,
      nonce: messageId,
      timestamp: BigInt(event.block.timestamp),
      bridgeType: BridgeTypeEnum.AMB,
      transactionStatus: TransactionStatusEnum.INITIATED,
      execution_id: undefined,

      initiatorNetwork: CHAIN.HOME.ID,
      initiator: sender?.toLowerCase(),
      initiatorToken: token!.toLowerCase(),
      initiatorAmount: amount,

      receiverNetwork: CHAIN.FOREIGN.ID,
      receiver: undefined,
      receiverToken: token!.toLowerCase(),
      receiverAmount: amount,
    };
    context.Transaction.set(newTx as any);
  }
});



// [Home] Gnosis - OmniBridge Mediator
ERC677BridgeHomeMediator.TokensBridgingInitiated.handler(async ({ event, context }) => {
  const messageId = event.params.messageId;

  const token = getTokenForBridge(event.srcAddress);
if (!token) {
    return;
}
  const sender = toLower(event.params.sender);
  const amount = event.params.value;

  const existing = await context.AMBTransfer.get(messageId);
  if (!existing) {
    context.AMBTransfer.set({
      id: messageId,
      messageId,
      token: token!,
      sender: sender,
      amount,
      recipient: undefined,
    });
  } else {
    context.AMBTransfer.set({
      ...existing,
      token: token!,
      sender: sender,
      amount,
    });
  }

  // Early backfill: if Transaction exists, set initiator fields immediately
  const tx = await context.Transaction.get(messageId);
  if (tx) {
    const updated = {
      ...tx,
      initiator: tx.initiator ?? sender,
      initiatorToken: tx.initiatorToken ?? token!,
      initiatorAmount: tx.initiatorAmount ?? amount,
    };
    context.Transaction.set(updated);
  } else {
    // Create Transaction early from mediator event (we have initiator + amount here)
    const newTx = {
      id: messageId,
      messageId,
      nonce: messageId,
      timestamp: BigInt(event.block.timestamp),
      bridgeType: BridgeTypeEnum.AMB,
      transactionStatus: TransactionStatusEnum.INITIATED,
      execution_id: undefined,

      initiatorNetwork: CHAIN.HOME.ID,
      initiator: sender,
      initiatorToken: token!,
      initiatorAmount: amount,

      receiverNetwork: CHAIN.FOREIGN.ID,
      receiver: undefined,
      receiverToken: token!,
      receiverAmount: amount,
    };
    context.Transaction.set(newTx as any);
  }
});

OmniBridgeHomeMediator.TokensBridged.handler(async ({ event, context }) => {
  const messageId = event.params.messageId;
  const token = toLower(event.params.token);
  const recipient = toLower(event.params.recipient);
  const amount = event.params.value;

  const existing = await context.AMBTransfer.get(messageId);
  if (!existing) {
    context.AMBTransfer.set({
      id: messageId,
      messageId,
      token: token!,
      sender: undefined,
      amount,
      recipient: recipient,
    });
  } else {
    context.AMBTransfer.set({
      ...existing,
      token: token!,
      recipient: recipient,
      amount,
    });
  }

  // Early backfill: if Transaction exists, set receiver fields immediately
  const tx = await context.Transaction.get(messageId);
  if (tx) {
    const updated = {
      ...tx,
      receiver: tx.receiver?.toLowerCase() ?? recipient?.toLowerCase(),
      receiverToken: tx.receiverToken ?? token!,
      receiverAmount: tx.receiverAmount ?? amount,
    };
    context.Transaction.set(updated);
  }
});


ERC677BridgeHomeMediator.TokensBridged.handler(async ({ event, context }) => {
  const messageId = event.params.messageId;

  const token = getTokenForBridge(event.srcAddress);
if (!token) {
    return;
}
  const recipient = toLower(event.params.recipient);
  const amount = event.params.value;

  const existing = await context.AMBTransfer.get(messageId);
  if (!existing) {
    context.AMBTransfer.set({
      id: messageId,
      messageId,
      token: token!,
      sender: undefined,
      amount,
      recipient: recipient,
    });
  } else {
    context.AMBTransfer.set({
      ...existing,
      token: token!,
      recipient: recipient,
      amount,
    });
  }

  // Early backfill: if Transaction exists, set receiver fields immediately
  const tx = await context.Transaction.get(messageId);
  if (tx) {
    const updated = {
      ...tx,
      receiver: tx.receiver?.toLowerCase() ?? recipient,
      receiverToken: tx.receiverToken ?? token!,
      receiverAmount: tx.receiverAmount ?? amount,
    };
    context.Transaction.set(updated);
  }
});
// [Foreign] Ethereum - OmniBridge Mediator
OmniBridgeForeignMediator.TokensBridgingInitiated.handler(async ({ event, context }) => {
  const messageId = event.params.messageId;
  const token = toLower(event.params.token);
  const sender = toLower(event.params.sender);
  const amount = event.params.value;

  const existing = await context.AMBTransfer.get(messageId);
  if (!existing) {
    context.AMBTransfer.set({
      id: messageId,
      messageId,
      token: token!,
      sender: sender,
      amount,
      recipient: undefined,
    });
  } else {
    context.AMBTransfer.set({
      ...existing,
      token: token!,
      sender: sender,
      amount,
    });
  }

  // Early backfill: if Transaction exists, set initiator fields immediately
  const tx = await context.Transaction.get(messageId);
  if (tx) {
    const updated = {
      ...tx,
      initiator: tx.initiator?.toLowerCase() ?? sender,
      initiatorToken: tx.initiatorToken ?? token!,
      initiatorAmount: tx.initiatorAmount ?? amount,
    };
    context.Transaction.set(updated);
  } else {
    // Create Transaction early from mediator event (we have initiator + amount here)
    const newTx = {
      id: messageId,
      messageId,
      nonce: messageId,
      timestamp: BigInt(event.block.timestamp),
      bridgeType: BridgeTypeEnum.AMB,
      transactionStatus: TransactionStatusEnum.INITIATED,
      execution_id: undefined,

      initiatorNetwork: CHAIN.FOREIGN.ID,
      initiator: sender,
      initiatorToken: token!,
      initiatorAmount: amount,

      receiverNetwork: CHAIN.HOME.ID,
      receiver: undefined,
      receiverToken: token!,
      receiverAmount: amount,
    };
    context.Transaction.set(newTx as any);
  }
});

ERC677BridgeForeignMediator.TokensBridgingInitiated.handler(async ({ event, context }) => {
  const messageId = event.params.messageId;

  const token = getTokenForBridge(event.srcAddress);
if (!token) {
    return;
}
  const sender = toLower(event.params.sender);
  const amount = event.params.value;

  const existing = await context.AMBTransfer.get(messageId);
  if (!existing) {
    context.AMBTransfer.set({
      id: messageId,
      messageId,
      token: token!,
      sender: sender,
      amount,
      recipient: undefined,
    });
  } else {
    context.AMBTransfer.set({
      ...existing,
      token: token!,
      sender: sender,
      amount,
    });
  }

  // Early backfill: if Transaction exists, set initiator fields immediately
  const tx = await context.Transaction.get(messageId);
  if (tx) {
    const updated = {
      ...tx,
      initiator: tx.initiator?.toLowerCase() ?? sender,
      initiatorToken: tx.initiatorToken ?? token!,
      initiatorAmount: tx.initiatorAmount ?? amount,
    };
    context.Transaction.set(updated);
  } else {
    // Create Transaction early from mediator event (we have initiator + amount here)
    const newTx = {
      id: messageId,
      messageId,
      nonce: messageId,
      timestamp: BigInt(event.block.timestamp),
      bridgeType: BridgeTypeEnum.AMB,
      transactionStatus: TransactionStatusEnum.INITIATED,
      execution_id: undefined,

      initiatorNetwork: CHAIN.FOREIGN.ID,
      initiator: sender,
      initiatorToken: token!,
      initiatorAmount: amount,

      receiverNetwork: CHAIN.HOME.ID,
      receiver: undefined,
      receiverToken: token!,
      receiverAmount: amount,
    };
    context.Transaction.set(newTx as any);
  }
});


OmniBridgeForeignMediator.TokensBridged.handler(async ({ event, context }) => {
  const messageId = event.params.messageId;
  const token = toLower(event.params.token);
  const recipient = toLower(event.params.recipient);
  const amount = event.params.value;

  const existing = await context.AMBTransfer.get(messageId);
  if (!existing) {
    context.AMBTransfer.set({
      id: messageId,
      messageId,
      token: token!,
      sender: undefined,
      amount,
      recipient: recipient,
    });
  } else {
    context.AMBTransfer.set({
      ...existing,
      token: token!,
      recipient: recipient,
      amount,
    });
  }

  // Early backfill: if Transaction exists, set receiver fields immediately
  const tx = await context.Transaction.get(messageId);
  if (tx) {
    const updated = {
      ...tx,
      receiver: tx.receiver?.toLowerCase() ?? recipient,
      receiverToken: tx.receiverToken ?? token!,
      receiverAmount: tx.receiverAmount ?? amount,
    };
    context.Transaction.set(updated);
  }
});



ERC677BridgeForeignMediator.TokensBridged.handler(async ({ event, context }) => {
  const messageId = event.params.messageId;

  const token = getTokenForBridge(event.srcAddress);
if (!token) {
    return;
}
  const recipient = toLower(event.params.recipient);
  const amount = event.params.value;

  const existing = await context.AMBTransfer.get(messageId);
  if (!existing) {
    context.AMBTransfer.set({
      id: messageId,
      messageId,
      token: token!,
      sender: undefined,
      amount,
      recipient: recipient,
    });
  } else {
    context.AMBTransfer.set({
      ...existing,
      token: token!,
      recipient: recipient,
      amount,
    });
  }

  // Early backfill: if Transaction exists, set receiver fields immediately
  const tx = await context.Transaction.get(messageId);
  if (tx) {
    const updated = {
      ...tx,
      receiver: tx.receiver?.toLowerCase() ?? recipient,
      receiverToken: tx.receiverToken ?? token!,
      receiverAmount: tx.receiverAmount ?? amount,
    };
    context.Transaction.set(updated);
  }
});
