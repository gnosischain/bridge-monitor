import { indexer, OmniBridgeForeignMediator, OmniBridgeHomeMediator, ERC677BridgeHomeMediator, ERC677BridgeForeignMediator } from "envio";
import { BridgeTypeEnum, CHAIN, TransactionStatusEnum } from "../../const";
import { getTokenForBridge } from "../../utils/erc677TokenMapping";
import { toLower } from "../../utils/toLower";
import { isRouterContract } from "../../utils/omnibridge";

// [Home] Gnosis - OmniBridge Mediator
indexer.onEvent(
  { contract: "OmniBridgeHomeMediator", event: "TokensBridgingInitiated" },
  async ({ event, context }) => {
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
}
);

// [Home] Gnosis - OmniBridge Mediator
indexer.onEvent(
  { contract: "ERC677BridgeHomeMediator", event: "TokensBridgingInitiated" },
  async ({ event, context }) => {
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
}
);

indexer.onEvent(
  { contract: "OmniBridgeHomeMediator", event: "TokensBridged" },
  async ({ event, context }) => {
  const messageId = event.params.messageId;
  const token = toLower(event.params.token);
  const recipient = toLower(event.params.recipient);
  const amount = event.params.value;

  // Don't store router contracts as recipient - they're intermediaries, not final destinations
  const finalRecipient = isRouterContract(recipient) ? undefined : recipient;

  const existing = await context.AMBTransfer.get(messageId);
  if (!existing) {
    context.AMBTransfer.set({
      id: messageId,
      messageId,
      token: token!,
      sender: undefined,
      amount,
      recipient: finalRecipient,
    });
  } else {
    context.AMBTransfer.set({
      ...existing,
      token: token!,
      recipient: finalRecipient ?? existing.recipient,
      amount,
    });
  }

  // Early backfill: if Transaction exists, set receiver fields immediately
  // Don't override existing receiver with a router contract address
  const tx = await context.Transaction.get(messageId);
  if (tx) {
    const newReceiver = isRouterContract(recipient)
      ? tx.receiver?.toLowerCase()
      : (tx.receiver?.toLowerCase() ?? recipient?.toLowerCase());
    const updated = {
      ...tx,
      receiver: newReceiver,
      receiverToken: tx.receiverToken ?? token!,
      receiverAmount: tx.receiverAmount ?? amount,
    };
    context.Transaction.set(updated);
  }
}
);

indexer.onEvent(
  { contract: "ERC677BridgeHomeMediator", event: "TokensBridged" },
  async ({ event, context }) => {
  const messageId = event.params.messageId;

  const token = getTokenForBridge(event.srcAddress);
  if (!token) {
    return;
  }
  const recipient = toLower(event.params.recipient);
  const amount = event.params.value;

  // Don't store router contracts as recipient - they're intermediaries, not final destinations
  const finalRecipient = isRouterContract(recipient) ? undefined : recipient;

  const existing = await context.AMBTransfer.get(messageId);
  if (!existing) {
    context.AMBTransfer.set({
      id: messageId,
      messageId,
      token: token!,
      sender: undefined,
      amount,
      recipient: finalRecipient,
    });
  } else {
    context.AMBTransfer.set({
      ...existing,
      token: token!,
      recipient: finalRecipient ?? existing.recipient,
      amount,
    });
  }

  // Early backfill: if Transaction exists, set receiver fields immediately
  // Don't override existing receiver with a router contract address
  const tx = await context.Transaction.get(messageId);
  if (tx) {
    const newReceiver = isRouterContract(recipient)
      ? tx.receiver?.toLowerCase()
      : (tx.receiver?.toLowerCase() ?? recipient);
    const updated = {
      ...tx,
      receiver: newReceiver,
      receiverToken: tx.receiverToken ?? token!,
      receiverAmount: tx.receiverAmount ?? amount,
    };
    context.Transaction.set(updated);
  }
}
);
// [Foreign] Ethereum - OmniBridge Mediator
indexer.onEvent(
  { contract: "OmniBridgeForeignMediator", event: "TokensBridgingInitiated" },
  async ({ event, context }) => {
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
}
);

indexer.onEvent(
  { contract: "ERC677BridgeForeignMediator", event: "TokensBridgingInitiated" },
  async ({ event, context }) => {
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
}
);

indexer.onEvent(
  { contract: "OmniBridgeForeignMediator", event: "TokensBridged" },
  async ({ event, context }) => {
  const messageId = event.params.messageId;
  const token = toLower(event.params.token);
  const recipient = toLower(event.params.recipient);
  const amount = event.params.value;

  // Don't store router contracts as recipient - they're intermediaries, not final destinations
  const finalRecipient = isRouterContract(recipient) ? undefined : recipient;

  const existing = await context.AMBTransfer.get(messageId);
  if (!existing) {
    context.AMBTransfer.set({
      id: messageId,
      messageId,
      token: token!,
      sender: undefined,
      amount,
      recipient: finalRecipient,
    });
  } else {
    context.AMBTransfer.set({
      ...existing,
      token: token!,
      recipient: finalRecipient ?? existing.recipient,
      amount,
    });
  }

  // Early backfill: if Transaction exists, set receiver fields immediately
  // Don't override existing receiver with a router contract address
  const tx = await context.Transaction.get(messageId);
  if (tx) {
    const newReceiver = isRouterContract(recipient)
      ? tx.receiver?.toLowerCase()
      : (tx.receiver?.toLowerCase() ?? recipient);
    const updated = {
      ...tx,
      receiver: newReceiver,
      receiverToken: tx.receiverToken ?? token!,
      receiverAmount: tx.receiverAmount ?? amount,
    };
    context.Transaction.set(updated);
  }
}
);

indexer.onEvent(
  { contract: "ERC677BridgeForeignMediator", event: "TokensBridged" },
  async ({ event, context }) => {
  const messageId = event.params.messageId;

  const token = getTokenForBridge(event.srcAddress);
  if (!token) {
    return;
  }
  const recipient = toLower(event.params.recipient);
  const amount = event.params.value;

  // Don't store router contracts as recipient - they're intermediaries, not final destinations
  const finalRecipient = isRouterContract(recipient) ? undefined : recipient;

  const existing = await context.AMBTransfer.get(messageId);
  if (!existing) {
    context.AMBTransfer.set({
      id: messageId,
      messageId,
      token: token!,
      sender: undefined,
      amount,
      recipient: finalRecipient,
    });
  } else {
    context.AMBTransfer.set({
      ...existing,
      token: token!,
      recipient: finalRecipient ?? existing.recipient,
      amount,
    });
  }

  // Early backfill: if Transaction exists, set receiver fields immediately
  // Don't override existing receiver with a router contract address
  const tx = await context.Transaction.get(messageId);
  if (tx) {
    const newReceiver = isRouterContract(recipient)
      ? tx.receiver?.toLowerCase()
      : (tx.receiver?.toLowerCase() ?? recipient);
    const updated = {
      ...tx,
      receiver: newReceiver,
      receiverToken: tx.receiverToken ?? token!,
      receiverAmount: tx.receiverAmount ?? amount,
    };
    context.Transaction.set(updated);
  }
}
);
