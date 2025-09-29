import { AMBForeign, AMBHome } from "generated";

// [Home]
// 1 Init. ERC20/ERC677 is transferred to the bridge contract
AMBHome.UserRequestForSignature.handler(async ({ event, context }) => {
  return;
});

// [Home]
// 2 Validation. Validators sign transaction
AMBHome.SignedForUserRequest.handler(async ({ event, context }) => {
  return;
});

// [Home]
// 3 Ready to execute on Foreign (treshold signatures reached)
AMBHome.CollectedSignatures.handler(async ({ event, context }) => {
  return;
});

// [Foreign]
// 4 Execution (token claimed)
AMBForeign.RelayedMessage.handler(async ({ event, context }) => {
  return;
});