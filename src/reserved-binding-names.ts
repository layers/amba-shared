/**
 * Reserved environment-variable names that customer Workers may not
 * declare; reserved by the platform runtime.
 */

/**
 * Wildcard-prefix reservations. A binding name is reserved if it starts
 * with any entry here. Wildcards future-proof the namespace — when the
 * platform ships a new `AMBA_*` or `EDGE_*` binding later, any customer
 * code that already declared a colliding name fails its next deploy
 * rather than silently shadowing the new platform binding at runtime.
 */
const RESERVED_PREFIXES = [
  // Every amba-platform-bound env / secret name.
  'AMBA_',
  // Every edge-platform-bound name.
  'EDGE_',
] as const;

/**
 * Exact-match reservations. Bindings whose names don't share a wildcarded
 * prefix — typically resource bindings (R2 bucket, Hyperdrive config,
 * service binding) where the convention is a single capitalized noun.
 */
const RESERVED_EXACT_NAMES = [
  'STORAGE',
  'HYPERDRIVE',
  'EDGE_DB_PROXY',
] as const;

/**
 * Workers-binding names must be uppercase identifiers per Cloudflare's
 * convention. The pattern matches `/^[A-Z][A-Z0-9_]*$/` — uppercase
 * letter, then any uppercase letter / digit / underscore.
 */
const VALID_BINDING_NAME_RE = /^[A-Z][A-Z0-9_]*$/;

/**
 * Maximum length. Cloudflare's documented hard cap on binding names is
 * 256 characters; in practice anything past ~64 is a customer error.
 * We cap at 64 for the same "fail with a useful message" rationale as
 * the regex above.
 */
const MAX_BINDING_NAME_LENGTH = 64;

/**
 * Return the reason a binding name is reserved (or invalid), or `null`
 * when the name is acceptable. Use this when surfacing actionable
 * errors to a customer — {@link isReservedBindingName} is the boolean
 * shorthand for code paths that only need allow/reject.
 */
export function getBindingReservationReason(name: string): string | null {
  // Structural checks first — empty / wrong type / too long.
  if (typeof name !== 'string' || name.length === 0) {
    return 'Binding name must be a non-empty string';
  }
  if (name.length > MAX_BINDING_NAME_LENGTH) {
    return `Binding name must be at most ${MAX_BINDING_NAME_LENGTH} characters`;
  }

  // Reserved-prefix and exact-name checks BEFORE the regex.
  for (const prefix of RESERVED_PREFIXES) {
    if (name.startsWith(prefix)) {
      return `Binding name starts with reserved prefix "${prefix}" (amba platform namespace)`;
    }
  }

  for (const exact of RESERVED_EXACT_NAMES) {
    if (name === exact) {
      return `Binding name "${exact}" is reserved by an amba platform binding`;
    }
  }

  // Final identifier-shape check.
  if (!VALID_BINDING_NAME_RE.test(name)) {
    return 'Binding name must match /^[A-Z][A-Z0-9_]*$/ (uppercase ASCII, digits, underscore; must start with a letter)';
  }

  return null;
}

/**
 * True if the supplied name cannot be used as a customer-declared
 * binding. Convenience boolean for code paths that don't need the
 * reason — call sites that surface validation errors should use
 * {@link getBindingReservationReason} so they can pass the message
 * through.
 */
export function isReservedBindingName(name: string): boolean {
  return getBindingReservationReason(name) !== null;
}

/**
 * Validate every customer-supplied binding name in a deploy plan in one
 * call. Returns the first reservation reason encountered (with the
 * offending name embedded in the message), or `null` if all names are
 * acceptable.
 *
 * The function does NOT short-circuit on the first valid name — it
 * checks every name in order so a malformed plan with multiple bad
 * names always reports the first one (deterministic error messaging
 * across CLI runs, useful when the customer fixes one name at a time).
 */
export function validateBindingNames(names: readonly string[]): string | null {
  for (const name of names) {
    const reason = getBindingReservationReason(name);
    if (reason !== null) {
      return `Invalid binding "${name}": ${reason}`;
    }
  }
  return null;
}

/**
 * Exposed for tests + tooling that wants to enumerate the reserved space
 * (e.g. CLI auto-completion that filters its suggestions, or docs
 * generation that lists reserved names for the customer reference).
 */
export const RESERVED_BINDING_PREFIXES: readonly string[] = RESERVED_PREFIXES;
export const RESERVED_BINDING_EXACT_NAMES: readonly string[] = RESERVED_EXACT_NAMES;
export { VALID_BINDING_NAME_RE, MAX_BINDING_NAME_LENGTH };
