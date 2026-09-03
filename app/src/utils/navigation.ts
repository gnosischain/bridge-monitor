// Any origin works here: it is only used as a base so relative paths can be
// resolved and normalised. It is never navigated to.
const INTERNAL_ORIGIN = 'https://internal.invalid'

/**
 * Narrows an untrusted value (typically a query string param) down to a
 * same-origin, root-relative path that is safe to hand to `router.push` /
 * `router.replace`, or `null` when it is not one.
 *
 * Next's router hard-navigates anything `isLocalURL()` rejects, straight
 * through `window.location.href = url`, so an unchecked value is both an open
 * redirect and a `javascript:` sink. Rejected here:
 * - absolute URLs: `https://evil.com`, `javascript:...`, `data:...`
 * - protocol-relative URLs: `//evil.com`, and the `/\evil.com` variant that
 *   the URL parser folds into it
 * - dot segments that normalise into one: `/..//evil.com`, `/%2e%2e//evil.com`
 * - arrays, which is what a repeated param (`?goBackURL=a&goBackURL=b`) yields
 */
export const getSafeInternalURL = (value: unknown): string | null => {
  if (typeof value !== 'string' || !value.startsWith('/')) return null

  try {
    const { hash, origin, pathname, search } = new URL(value, INTERNAL_ORIGIN)

    // The origin check catches anything that resolved off-site. `pathname` is
    // only normalised at this point, so a path that collapses down to `//host`
    // has to be rejected here rather than on the raw input.
    if (origin !== INTERNAL_ORIGIN || !pathname.startsWith('/') || pathname.startsWith('//')) {
      return null
    }

    return `${pathname}${search}${hash}`
  } catch {
    return null
  }
}
