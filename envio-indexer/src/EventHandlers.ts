/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  XDaiForeign,
  XDaiForeign_RelayedMessage,
  XDaiForeign_UserRequestForAffirmation,
  XDaiHome,
  XDaiHome_AffirmationCompleted,
  XDaiHome_CollectedSignatures,
  XDaiHome_SignedForAffirmation,
  XDaiHome_SignedForUserRequest,
  XDaiHome_UserRequestForSignature,
} from "generated";

XDaiForeign.RelayedMessage.handler(async ({ event, context }) => {
  const entity: XDaiForeign_RelayedMessage = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    recipient: event.params.recipient,
    value: event.params.value,
    transactionHash: event.params.transactionHash,
  };

  context.XDaiForeign_RelayedMessage.set(entity);
});

XDaiForeign.UserRequestForAffirmation.handler(async ({ event, context }) => {
  const entity: XDaiForeign_UserRequestForAffirmation = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    recipient: event.params.recipient,
    value: event.params.value,
    nonce: event.params.nonce,
  };

  context.XDaiForeign_UserRequestForAffirmation.set(entity);
});

XDaiHome.AffirmationCompleted.handler(async ({ event, context }) => {
  const entity: XDaiHome_AffirmationCompleted = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    recipient: event.params.recipient,
    value: event.params.value,
    nonce: event.params.nonce,
  };

  context.XDaiHome_AffirmationCompleted.set(entity);
});

XDaiHome.CollectedSignatures.handler(async ({ event, context }) => {
  const entity: XDaiHome_CollectedSignatures = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    authorityResponsibleForRelay: event.params.authorityResponsibleForRelay,
    messageHash: event.params.messageHash,
    numberOfCollectedSignatures: event.params.NumberOfCollectedSignatures,
  };

  context.XDaiHome_CollectedSignatures.set(entity);
});

XDaiHome.SignedForAffirmation.handler(async ({ event, context }) => {
  const entity: XDaiHome_SignedForAffirmation = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    signer: event.params.signer,
    nonce: event.params.nonce,
  };

  context.XDaiHome_SignedForAffirmation.set(entity);
});

XDaiHome.SignedForUserRequest.handler(async ({ event, context }) => {
  const entity: XDaiHome_SignedForUserRequest = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    signer: event.params.signer,
    messageHash: event.params.messageHash,
  };

  context.XDaiHome_SignedForUserRequest.set(entity);
});

XDaiHome.UserRequestForSignature.handler(async ({ event, context }) => {
  const entity: XDaiHome_UserRequestForSignature = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    recipient: event.params.recipient,
    value: event.params.value,
  };

  context.XDaiHome_UserRequestForSignature.set(entity);
});
