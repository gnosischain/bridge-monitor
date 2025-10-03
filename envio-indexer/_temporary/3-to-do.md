1. For AMB - include 3rd party AMB tokens from here: app/src/utils/token-overrides.ts, including commented ones.

2. See how to pre-fill Validators (via onBlock handler or any other way) and check maybe we don't need to do it

3. Use Effect API for fetching Transaction data etc. (?) ❌ - used only for external calls.

4. XDAI bridge:
  - Eth -> GC: add UserRequestForAffirmation_NoNonce handler ✅
    - check USDS/DAI as sender token ✅
  - GC -> Eth ✅
5. AMB bridge:
  - Eth -> GC ✅
  - GC -> Eth ✅

6. Validators:
  - XDAIValidators
  - AMBValidators

7. Rewrite queries from app (app/src/hooks/subgraph)

8. Ensure where tx hash is actually needed. ✅

9. Index DAI and USDS transfers on Foreign chain, and fetch initiator and token from there. ✅