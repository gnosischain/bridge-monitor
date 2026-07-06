# Branching & Release Flow — Deep Dive

This document explains _why_ the branching rules in
[`CONTRIBUTING.md`](../CONTRIBUTING.md) work the way they do. If you just want the
rules, read the `Git Workflow` section there. Read this if you're wondering
"the branches show as behind and there are all these merge commits — is something
broken, and should I rebase to fix it?" (Short answer: nothing is broken, and no.)

## The three long-lived branches

| Branch    | Environment | Deployed to                             |
| --------- | ----------- | --------------------------------------- |
| `develop` | Development | `bridge-explorer.dev.gnosisdev.com`     |
| `staging` | Staging     | `bridge-explorer.staging.gnosisdev.com` |
| `main`    | Production  | `bridge.gnosischain.com`                |

Normal changes flow forward: **feature branch → `develop` → `staging` → `main`**.

- Feature → `develop`: **squash** merge (keeps `develop`'s history readable).
- `develop` → `staging` → `main`: **merge commit** (never squash/rebase).

## Why promotions use merge commits, not squash/rebase

A merge commit preserves the original commit SHAs, so each downstream branch
genuinely _contains_ the upstream commits. Git's ancestry stays intact, which is
what lets it compute a correct merge base on the next promotion.

Squash and rebase both create **new** commits with **new** SHAs holding the same
diff. The downstream branch then has a _duplicate_ of changes it's supposed to
share. Git no longer sees the histories as related, so on the next cycle it
re-applies or conflicts on code that was already merged. That's the opposite of
what you want for branches that are merged between each other repeatedly.

## Why the extra merge commits never cause conflicts

A merge conflict comes from two branches changing the **same lines of content** in
different ways. It has nothing to do with how many merge commits exist. After a
full cycle, all three branches hold **identical content** — the merge commits
carry no content of their own; they just record where two histories joined.

Here's the history shape after two cycles (`M` = merge commit):

```
develop:  …─F───────────G                     feature commits only
                \         \
staging:  …─────M1─────────M3                  M1 = merge develop→staging (cycle 1)
                  \          \                 M3 = merge develop→staging (cycle 2)
main:     …────────M2─────────M4               M2 = merge staging→main   (cycle 1)
                                               M4 = merge staging→main   (cycle 2)
```

The key mechanism: **each merge commit becomes the merge base for the next merge.**

- Cycle 2's `develop → staging` merge uses `F` as the base. `develop` changed
  `F → G` (real content); `staging`'s side (`M1`) has the _same content as `F`_.
  Only one side changed content, so git applies `G` cleanly. **No conflict.**
- Cycle 2's `staging → main` merge uses `M1` as the base. `staging` added `G`;
  `main`'s side (`M2`) has the _same content as `M1`_. Only one side changed
  content. **No conflict.**

So the "extra" merge commits don't merely avoid conflicts — they actively _keep
merges clean_ by giving each next merge a tight, content-accurate base.

## "Behind" is the normal state

Because `M1`/`M2` live only on their downstream branches, git reports the upstream
branches as behind:

- `staging` is "1 behind `main`" (the staging→main merge commit).
- `develop` is behind `staging` and `main` by the promotion merge commits.

This is the **expected, healthy** gitflow state, not drift. The content is
identical; only empty merge nodes differ. **Do not** rebase or squash these
branches to make the counter read zero — that rewrites shared SHAs and breaks the
merge-base chain, causing the very conflicts it looks like it's preventing.

You can confirm content parity at any time:

```bash
git fetch --all
git diff origin/staging origin/main   # empty == identical content
```

## Hotfixes & backporting

Urgent production fixes are **not** routed through `develop → staging`. They go
**straight to `main`**:

1. Branch `hotfix/<name>` from `main`, make the fix, and merge it into `main`
   (PR base `main`).
2. Backport `main` into **both** other branches so they don't fall behind — two
   PRs, each sourced from `main`:

   ```bash
   # main -> staging
   git checkout -b backport/main-to-staging origin/main
   git push -u origin backport/main-to-staging   # open PR, base: staging

   # main -> develop
   git checkout -b backport/main-to-develop origin/main
   git push -u origin backport/main-to-develop   # open PR, base: develop
   ```

   Merge both with a **merge commit**, not squash/rebase.

This repo already follows exactly this pattern. The `hotfix/bridge-ui-prod` cycle
was three sequential PRs:

| PR   | Merge                          | Purpose             |
| ---- | ------------------------------ | ------------------- |
| #391 | `hotfix/bridge-ui-prod` → main | fix lands on prod   |
| #392 | main → staging                 | backport to staging |
| #393 | main → develop                 | backport to develop |

**Backport from `main`, the source of truth** — that's where the hotfix actually
landed. Backport to _both_ branches; skipping the `develop` one is the common
failure mode: the fix reaches production and staging but silently never lands on
`develop`, so `develop` drifts behind. This is exactly what happened in the
warning-banner cycle — the `main → staging` backport was done (PR #402) but the
`main → develop` one was missed, leaving `develop` a step behind.

### Backports create "criss-cross" history — that's fine

A backport merges `main → develop` (and `main → staging`) while the normal flow
merges `develop → staging → main`, so history has merges in both directions
("criss-cross"). Git's recursive merge strategy handles multiple merge bases
automatically; as long as content stays synchronized, merges still resolve
cleanly. Criss-cross is normal in gitflow and is not a problem.

## When conflicts actually happen

Only two situations:

1. **Content added out of order** — a hotfix committed straight to `main`
   (or `staging`) and never backported to `develop`. Fix: backport from `main`
   (above).
2. **Squash/rebase on a long-lived branch** — rewrites shared SHAs so git loses
   the merge base. Fix: only ever use merge commits for
   `develop`/`staging`/`main`.

Avoid both and the `develop → staging → main` flow stays conflict-free.
