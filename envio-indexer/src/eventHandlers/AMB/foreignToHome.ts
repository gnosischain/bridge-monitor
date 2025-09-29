import { AMBForeign, AMBHome } from "generated";

// [Foreign]
// 1 Init. ERC20/ERC677 is transferred to the bridge contract
AMBForeign.UserRequestForAffirmation.handler(async ({ event, context }) => { 
  return;
});

// [Home]
// 2 Validation. Validators sign transaction
AMBHome.SignedForAffirmation.handler(async ({ event, context }) => {
  return;
});

// [Home]
// 3 Execution. Validator executes transaction
AMBHome.AffirmationCompleted.handler(async ({ event, context }) => {
  return;
});