import { XDAIForeign, XDAIHome } from "generated";

// [Home]
// 1 Init. DAI is transferred to the bridge contract
// Before Hashi update
XDAIHome.UserRequestForSignature_NoNonceNoToken.handler(async ({ event, context }) => {
  return;
});

// After Hashi update
XDAIHome.UserRequestForSignature_WithNonceNoToken.handler(async ({ event, context }) => {
  return;
});

// After USDS migration (current version)
XDAIHome.UserRequestForSignature.handler(async ({ event, context }) => {
  return;
});

// [Home]
// 2 Validation. Validators sign transaction
XDAIHome.SignedForUserRequest.handler(async ({ event, context }) => {
  return;
});

// [Home]
// 3 Ready to execute on Foreign (treshold signatures reached)
XDAIHome.CollectedSignatures.handler(async ({ event, context }) => {
  return;
});


// [Foreign]
// 4 Execution (token claimed)
XDAIForeign.RelayedMessage.handler(async ({ event, context }) => {
  return;
});