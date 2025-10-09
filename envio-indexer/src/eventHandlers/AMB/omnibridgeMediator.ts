import { OmniBridgeForeignMediator, OmniBridgeHomeMediator } from "generated";

// Normalize to lowercase hex string
const toLower = (v?: string) => (typeof v === "string" ? v.toLowerCase() : v);

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
      messageHash: undefined,
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
      messageHash: undefined,
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
      receiver: tx.receiver ?? recipient,
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
      messageHash: undefined,
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
      messageHash: undefined,
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
      receiver: tx.receiver ?? recipient,
      receiverToken: tx.receiverToken ?? token!,
      receiverAmount: tx.receiverAmount ?? amount,
    };
    context.Transaction.set(updated);
  }
});
